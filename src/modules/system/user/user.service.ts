import { Injectable } from '@nestjs/common';
import { isEmpty, omit, uniq } from 'lodash';
import { In, Not } from 'typeorm';
import {
  SysUserAddReqDto,
  SysUserPageItemRespDto,
  SysUserRdpjInfoRespDto,
  SysUserUpdateReqDto,
} from './user.dto';
import { AbstractService } from '/@/common/abstract.service';
import { encryptByMD5 } from '/@/common/utils/cipher';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { ErrorEnum } from '/@/constants/errorx';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { SysJobEntity } from '/@/entities/sys-job.entity';
import { SysProfessionEntity } from '/@/entities/sys-profession.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { ISysUserPagingQueryItem } from '/@/interfaces/repository';
import { SysDeptRepository } from '/@/repositories/sys-dept.repository';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { AppGeneralService } from '/@/shared/services/app-general.service';

@Injectable()
export class SystemUserService extends AbstractService {
  constructor(
    private readonly generalService: AppGeneralService,
    private readonly configService: AppConfigService,
    private readonly sysDeptRepo: SysDeptRepository,
  ) {
    super();
  }

  async getUserByPage(page: number, limit: number, queryDeptId: number) {
    // 需要查询的部门
    let deptIds: number[] = [];
    if (queryDeptId === TREE_ROOT_NODE_ID) {
      const ret = await this.entityManager.find(SysDeptEntity, {
        select: ['id'],
      });

      deptIds = ret.map((e) => e.id);
    } else {
      deptIds = await this.sysDeptRepo.findAllSubIds(queryDeptId, true);
    }

    const rows = await this.nativeQuery<ISysUserPagingQueryItem[]>(
      `SELECT
        u.id,
        u.dept_id AS deptId,
        u.job_id AS jobId,
        u.profession_id AS professionId,
        u.account,
        u.username,
        u.nickname,
        u.avatar,
        u.gender,
        IFNULL(p.name, 'NULL') AS professionName,
        IFNULL(j.name, 'NULL') AS jobName,
        IFNULL(d.name, 'NULL') AS deptName,
        IFNULL(GROUP_CONCAT(r.name), 'NULL') AS roleNames,
        IFNULL(GROUP_CONCAT(r.id), 0) AS roleIds,
        u.email,
        u.mobile,
        u.remark,
        u.order_num AS orderNum,
        u.status,
        u.create_time AS createTime,
        u.update_time AS updateTime
      FROM
      (
        SELECT * FROM ${this.getTableName(SysUserEntity)}
        WHERE id != ? AND dept_id IN(?)
        ORDER BY order_num DESC
        LIMIT ?, ?
      ) u
      LEFT JOIN ${this.getTableName(
        SysProfessionEntity,
      )} p ON u.profession_id = p.id
      LEFT JOIN ${this.getTableName(SysDeptEntity)} d ON u.dept_id = d.id
      LEFT JOIN ${this.getTableName(SysJobEntity)} j ON u.job_id = j.id
      LEFT JOIN ${this.getTableName(
        SysRoleEntity,
      )} r ON JSON_CONTAINS(u.role_ids, JSON_ARRAY(r.id))
      GROUP BY u.id`,
      [
        this.configService.appConfig.rootUserId,
        deptIds,
        (page - 1) * limit,
        limit,
      ],
    );

    const count = await this.entityManager.count(SysUserEntity, {
      where: {
        id: Not(this.configService.appConfig.rootUserId),
        deptId: In(deptIds),
      },
    });

    return rows
      .map((e) => new SysUserPageItemRespDto(e))
      .toPage({
        page,
        limit,
        total: count,
      });
  }

  async updateUserPassword(uid: number, pwd: string): Promise<void> {
    if (this.generalService.isRootUser(uid)) {
      throw new Error(`User ${uid} illegally changes the password of the root`);
    }

    const encryPwd = encryptByMD5(
      `${pwd}${this.configService.appConfig.userPwdSalt}`,
    );

    await this.entityManager.update(
      SysUserEntity,
      { id: uid },
      { password: encryPwd },
    );
  }

  async deleteUser(uid: number): Promise<void> {
    if (this.generalService.isRootUser(uid)) {
      throw new Error(`User ${uid} illegally delete root`);
    }

    await this.entityManager.delete(SysUserEntity, { id: uid });
  }

  async getUserRoleDeptProfJobInfo(edituid: number) {
    if (this.generalService.isRootUser(edituid)) {
      throw new Error(`User ${edituid} illegally obtaining root info`);
    }

    const profs = await this.entityManager.find(SysProfessionEntity, {
      select: ['id', 'name'],
    });

    const depts = await this.entityManager.find(SysDeptEntity, {
      select: ['id', 'name', 'parentId'],
    });

    const jobs = await this.entityManager.find(SysJobEntity, {
      select: ['id', 'name'],
    });

    const allRoles = await this.entityManager.find(SysRoleEntity, {
      select: ['id', 'parentId', 'name'],
    });

    return new SysUserRdpjInfoRespDto(profs, depts, jobs, allRoles);
  }

  async addUser(item: SysUserAddReqDto): Promise<void> {
    await this.checkJobOrDeptOrProfExists(
      item.jobId,
      item.deptId,
      item.professionId,
    );

    // 创建用户
    await this.entityManager.insert(SysUserEntity, {
      ...omit(item, 'roleIds'),
      roleIds: uniq(item.roleIds),
      password: this.generalService.generateUserPassword(),
    });
  }

  async updateUser(item: SysUserUpdateReqDto): Promise<void> {
    await this.checkJobOrDeptOrProfExists(
      item.jobId,
      item.deptId,
      item.professionId,
    );

    // 更新用户
    await this.entityManager.update(
      SysUserEntity,
      { id: item.id },
      {
        ...omit(item, ['roleIds', 'id']),
        roleIds: uniq(item.roleIds),
      },
    );
  }

  /**
   * 检查Job、Dept、Profession ID是否存在，不存在则报错
   */
  private async checkJobOrDeptOrProfExists(
    jobId: number,
    deptId: number,
    profId: number,
  ): Promise<void> {
    const jobInfo = await this.entityManager.findOne(SysJobEntity, {
      select: ['id'],
      where: {
        id: jobId,
      },
    });

    if (isEmpty(jobInfo)) {
      throw new ApiFailedException(ErrorEnum.CODE_1102);
    }

    const profInfo = await this.entityManager.findOne(SysProfessionEntity, {
      select: ['id'],
      where: {
        id: profId,
      },
    });

    if (isEmpty(profInfo)) {
      throw new ApiFailedException(ErrorEnum.CODE_1103);
    }

    const deptInfo = await this.entityManager.findOne(SysDeptEntity, {
      select: ['id'],
      where: {
        id: deptId,
      },
    });

    if (isEmpty(deptInfo)) {
      throw new ApiFailedException(ErrorEnum.CODE_1104);
    }
  }
}
