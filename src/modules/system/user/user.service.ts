import { Injectable } from '@nestjs/common';
import { uniq } from 'lodash';
import { In, Not } from 'typeorm';
import {
  RoleInfoDto,
  SysUserPageItemRespDto,
  SysUserRdpjInfoRespDto,
} from './user.dto';
import type { ISystemUserPageQueryRowItem } from './user.interface';
import { AbstractService } from '/@/common/abstract.service';
import { encryptByMD5 } from '/@/common/utils/cipher';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { BoolTypeEnum } from '/@/constants/type';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { SysJobEntity } from '/@/entities/sys-job.entity';
import { SysProfessionEntity } from '/@/entities/sys-profession.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { AuthInspectService } from '/@/shared/services/auth-inspect.service';

@Injectable()
export class SystemUserService extends AbstractService {
  constructor(
    private inspectService: AuthInspectService,
    private configService: AppConfigService,
  ) {
    super();
  }

  async getUserByPage(
    page: number,
    limit: number,
    queryDeptId: number,
    uid: number,
  ) {
    const deptIds = await this.getSubDeptAndSelfIds(queryDeptId);

    // 去除超级管理员以及自身
    const ignoreUserIds = await this.inspectService.getAllSuperAdminUserIds();
    if (!ignoreUserIds.includes(uid)) {
      ignoreUserIds.push(uid);
    }

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
        WHERE id NOT IN (?) AND dept_id IN(?)
        ORDER BY order_num DESC
        LIMIT ?, ?
      ) u
      LEFT JOIN sys_profession p ON u.profession_id = p.id
      LEFT JOIN sys_dept d ON u.dept_id = d.id
      LEFT JOIN sys_job j ON u.job_id = j.id
      LEFT JOIN sys_role r ON JSON_CONTAINS(u.role_ids, JSON_ARRAY(r.id))
      GROUP BY u.id`,
      [ignoreUserIds, deptIds, (page - 1) * limit, limit],
    );

    const count = await this.entityManager.count(SysUserEntity, {
      where: {
        id: Not(In(ignoreUserIds)),
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
    await this.inspectService.inspectSuperAdminThrow(uid);

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
    await this.inspectService.inspectSuperAdminThrow(uid);
    await this.entityManager.delete(SysUserEntity, { id: uid });
  }

  async getUserRoleDeptProfJobInfo(uid: number, opuid: number) {
    await this.inspectService.inspectSuperAdminThrow(uid);

    const profs = await this.entityManager.find(SysProfessionEntity, {
      select: ['id', 'name'],
    });

    const depts = await this.entityManager.find(SysDeptEntity, {
      select: ['id', 'name', 'parentId'],
    });

    const jobs = await this.entityManager.find(SysJobEntity, {
      select: ['id', 'name'],
    });

    // 如果是超级管理员，则直接返回全部角色
    const operateIsSuperAdmin = await this.inspectService.inspectSuperAdmin(
      opuid,
    );
    if (operateIsSuperAdmin) {
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

    // 查找当前操作用户所拥有的角色
    const users = await this.entityManager.find(SysUserEntity, {
      where: {
        id: In([uid, opuid]),
      },
    });
  }

  /**
   * 指定部门编号获取自身以及自身子部门的所有ID
   */
  async getSubDeptAndSelfIds(id: number): Promise<number[]> {
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
