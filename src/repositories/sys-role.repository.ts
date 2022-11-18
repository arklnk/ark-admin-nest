import { Provider } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { uniq } from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { TREE_ROOT_NODE_ID } from '../constants/core';
import { SysRoleEntity } from '../entities/sys-role.entity';

export const SysRoleRepositoryProvider: Provider = {
  provide: getRepositoryToken(SysRoleEntity),
  inject: [getDataSourceToken()],
  useFactory(datasource: DataSource) {
    return datasource
      .getRepository(SysRoleEntity)
      .extend(extendsSysRoleRepository);
  },
};

export interface SysRoleRepository extends Repository<SysRoleEntity> {
  /**
   * 查找所有父级的所有子级角色编号
   */
  findAllSubIds(
    this: Repository<SysRoleEntity>,
    parentIds: number[],
    includeSelf?: boolean,
  ): Promise<number[]>;
}

export const extendsSysRoleRepository: Pick<
  SysRoleRepository,
  'findAllSubIds'
> = {
  async findAllSubIds(
    parentIds: number[],
    includeSelf = false,
  ): Promise<number[]> {
    if (parentIds.includes(TREE_ROOT_NODE_ID)) {
      throw new Error('parent role ids cannot be set the root node');
    }

    const allSubRoles: number[] = [];
    let lastQueryIds: number[] = [...parentIds];

    do {
      const queryIds = await this.createQueryBuilder('role')
        .select(['role.id'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      lastQueryIds = queryIds
        .map((e) => e.id)
        .filter((e) => !lastQueryIds.includes(e) && !allSubRoles.includes(e));

      allSubRoles.push(...lastQueryIds);
    } while (lastQueryIds.length > 0);

    if (includeSelf) {
      allSubRoles.push(...parentIds);
    }

    return uniq(allSubRoles);
  },
};
