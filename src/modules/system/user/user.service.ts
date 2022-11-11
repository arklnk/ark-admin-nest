import { Injectable } from '@nestjs/common';
import { difference, isEmpty, omit, uniq, without } from 'lodash';
import { In, Not } from 'typeorm';
import {
  RoleInfoDto,
  SysUserAddReqDto,
  SysUserPageItemRespDto,
  SysUserRdpjInfoRespDto,
  SysUserUpdateReqDto,
} from './user.dto';
import type { ISystemUserPageQueryRowItem } from './user.interface';
import { AbstractService } from '/@/common/abstract.service';
import { encryptByMD5 } from '/@/common/utils/cipher';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { ErrorEnum } from '/@/constants/errorx';
import { BoolTypeEnum } from '/@/constants/type';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { SysJobEntity } from '/@/entities/sys-job.entity';
import { SysProfessionEntity } from '/@/entities/sys-profession.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { AppGeneralService } from '/@/shared/services/app-general.service';

@Injectable()
export class SystemUserService extends AbstractService {
  constructor(
    private generalService: AppGeneralService,
    private configService: AppConfigService,
  ) {
    super();
  }

  async getUserByPage(page: number, limit: number, queryDeptId: number) {
    const deptIds = await this.getSubDeptAndSelfIds(queryDeptId);

    const rows = await this.nativeQuery<ISystemUserPageQueryRowItem[]>(
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
      LEFT JOIN sys_profession p ON u.profession_id = p.id
      LEFT JOIN sys_dept d ON u.dept_id = d.id
      LEFT JOIN sys_job j ON u.job_id = j.id
      LEFT JOIN sys_role r ON JSON_CONTAINS(u.role_ids, JSON_ARRAY(r.id))
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

  async getUserRoleDeptProfJobInfo(edituid: number, opuid: number) {
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

    // 超级管理员，则直接返回全部角色
    const operateIsRootUser = this.generalService.isRootUser(opuid);
    if (operateIsRootUser) {
      const allRoles = await this.entityManager.find(SysRoleEntity, {
        select: ['id', 'parentId', 'name'],
      });

      return new SysUserRdpjInfoRespDto(
        profs,
        depts,
        jobs,
        allRoles.map((e) => new RoleInfoDto(e, BoolTypeEnum.True)),
      );
    }

    const opUserInfo = await this.entityManager.findOne(SysUserEntity, {
      select: ['id', 'roleIds'],
      where: {
        id: opuid,
      },
    });

    const rolesIds: number[] = [];
    // 获取当前操作的管理员所能编辑的所有角色权限
    rolesIds.push(...opUserInfo.roleIds);

    // 如果需要查询的用户时，则要判断查询的用户具备的角色是否都可被当前操作的管理员所进行编辑
    if (edituid !== 0) {
      const editUserInfo = await this.entityManager.findOne(SysUserEntity, {
        select: ['id', 'roleIds'],
        where: {
          id: edituid,
        },
      });

      rolesIds.push(...editUserInfo.roleIds);
    }

    const rolesInfo = await this.entityManager.find(SysRoleEntity, {
      select: ['id', 'name', 'parentId'],
      where: {
        id: In(rolesIds),
      },
    });

    return new SysUserRdpjInfoRespDto(
      profs,
      depts,
      jobs,
      rolesInfo.map((e) => {
        const has = opUserInfo.roleIds.includes(e.id)
          ? BoolTypeEnum.True
          : BoolTypeEnum.False;
        return new RoleInfoDto(e, has);
      }),
    );
  }

  async addUser(item: SysUserAddReqDto, opuid: number): Promise<void> {
    await this.checkJobOrDeptOrProfExists(
      item.jobId,
      item.deptId,
      item.professionId,
    );

    // 检查新增的用户角色是否为当前操作用户可操作范围，防止越权
    const opUserInfo = await this.entityManager.findOne(SysUserEntity, {
      select: ['id', 'roleIds'],
      where: {
        id: opuid,
      },
    });

    let isExceed = false;
    if (!this.generalService.isRootUser(opuid)) {
      isExceed = item.roleIds.some((e) => !opUserInfo.roleIds.includes(e));
    }
    if (isExceed) {
      throw new ApiFailedException(ErrorEnum.CODE_1101);
    }

    // 创建用户
    await this.entityManager.insert(SysUserEntity, {
      ...omit(item, 'roleIds'),
      roleIds: uniq(item.roleIds),
      password: this.generalService.generateUserPassword(),
    });
  }

  async updateUser(item: SysUserUpdateReqDto, opuid: number): Promise<void> {
    await this.checkJobOrDeptOrProfExists(
      item.jobId,
      item.deptId,
      item.professionId,
    );

    let isExceed = false;
    if (!this.generalService.isRootUser(opuid)) {
      const users = await this.entityManager.find(SysUserEntity, {
        select: ['id', 'roleIds'],
        where: {
          id: In([item.id, opuid]),
        },
      });

      const editUser = users.find((e) => e.id === item.id);
      const opUser = users.find((e) => e.id === opuid);

      // 当被编辑用户的角色权限与当前操作用户的角色权限存在差异时，检查是否操作越权
      let forbiddenRoleIds: number[] = difference(
        editUser.roleIds,
        opUser.roleIds,
      );

      // 查找是否有修改了当前操作用户所不具备的权限
      isExceed = forbiddenRoleIds.some((e) => !item.roleIds.includes(e));

      // 如果已经越权了则无需再做后续判断
      if (!isExceed) {
        // 过滤掉禁止修改的权限，剩余判断自身操作用户所拥有的的权限，防止越权
        forbiddenRoleIds = without(item.roleIds, ...forbiddenRoleIds);
        isExceed = forbiddenRoleIds.some((e) => !opUser.roleIds.includes(e));
      }
    }
    if (isExceed) {
      throw new ApiFailedException(ErrorEnum.CODE_1101);
    }

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

  /**
   * 指定部门编号获取自身以及自身子部门的所有ID
   */
  private async getSubDeptAndSelfIds(id: number): Promise<number[]> {
    const allDeptIds: number[] = [];
    let lastQueryIds: number[] = [id];

    do {
      const deptIds = await this.entityManager
        .createQueryBuilder(SysDeptEntity, 'dept')
        .select(['dept.id'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      lastQueryIds = deptIds.map((e) => e.id);
      allDeptIds.push(...lastQueryIds);
    } while (lastQueryIds.length > 0);

    if (id !== TREE_ROOT_NODE_ID) {
      allDeptIds.push(id);
    }

    return uniq(allDeptIds);
  }
}
