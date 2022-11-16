import { In, Not, Repository } from 'typeorm';
import { SysDeptEntity } from '../entities/sys-dept.entity';
import { SysJobEntity } from '../entities/sys-job.entity';
import { SysProfessionEntity } from '../entities/sys-profession.entity';
import { SysRoleEntity } from '../entities/sys-role.entity';
import { ISysUserPagingQueryItem } from '/@//interfaces/repository';
import { SysUserEntity } from '/@/entities/sys-user.entity';

export interface SysUserRepository extends Repository<SysUserEntity> {
  /**
   * 分页查询用户信息
   */
  findUserByPaging(
    this: Repository<SysUserEntity>,
    page: number,
    limit: number,
    deptIds: number[],
    rootId: number,
  ): Promise<[ISysUserPagingQueryItem[], number]>;
}

export const extendsSysUserRepository: Pick<
  SysUserRepository,
  'findUserByPaging'
> = {
  async findUserByPaging(
    page: number,
    limit: number,
    deptIds: number[],
    rootUserId: number,
  ): Promise<[ISysUserPagingQueryItem[], number]> {
    // 获取表名，防止修改表名后sql失效
    const sysprofTable =
      this.manager.connection.getMetadata(SysProfessionEntity).tableName;
    const sysdeptTable =
      this.manager.connection.getMetadata(SysDeptEntity).tableName;
    const sysjobTable =
      this.manager.connection.getMetadata(SysJobEntity).tableName;
    const sysroleTable =
      this.manager.connection.getMetadata(SysRoleEntity).tableName;

    const items: ISysUserPagingQueryItem[] = await this.query(
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
          SELECT * FROM ${this.metadata.tableName}
          WHERE id != ? AND dept_id IN(?)
          ORDER BY order_num DESC
          LIMIT ?, ?
        ) u
        LEFT JOIN ${sysprofTable} p ON u.profession_id = p.id
        LEFT JOIN ${sysdeptTable} d ON u.dept_id = d.id
        LEFT JOIN ${sysjobTable} j ON u.job_id = j.id
        LEFT JOIN ${sysroleTable} r ON JSON_CONTAINS(u.role_ids, JSON_ARRAY(r.id))
        GROUP BY u.id`,
      [rootUserId, deptIds, (page - 1) * limit, limit],
    );

    const count = await this.count({
      where: {
        id: Not(rootUserId),
        deptId: In(deptIds),
      },
    });

    return [items, count];
  },
};
