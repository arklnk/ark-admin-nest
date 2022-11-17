import { Provider } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { uniq } from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { TREE_ROOT_NODE_ID } from '../constants/core';
import { SysPermMenuEntity } from '../entities/sys-perm-menu.entity';

export const SysPermMenuRepositoryProvider: Provider = {
  provide: getRepositoryToken(SysPermMenuEntity),
  inject: [getDataSourceToken()],
  useFactory: (datasrouce: DataSource) => {
    return datasrouce
      .getRepository(SysPermMenuEntity)
      .extend(extendsSysDeptRepository);
  },
};

export interface SysPermMenuRepository extends Repository<SysPermMenuEntity> {
  /**
   * 查找当前父级的所有子级编号
   */
  findAllSubIds(
    this: Repository<SysPermMenuEntity>,
    parentId: number,
    includeSelf?: boolean,
  ): Promise<number[]>;
}

export const extendsSysDeptRepository: Pick<
  SysPermMenuRepository,
  'findAllSubIds'
> = {
  async findAllSubIds(
    parentId: number,
    includeSelf = false,
  ): Promise<number[]> {
    if (parentId === TREE_ROOT_NODE_ID) {
      throw new Error('parent perm menu id cannot be set the root node');
    }

    const allSubIds: number[] = [];
    let lastQueryIds: number[] = [parentId];

    do {
      const queryIds = await this.createQueryBuilder('pm')
        .select(['pm.id'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      lastQueryIds = queryIds.map((e) => e.id);
      allSubIds.push(...lastQueryIds);
    } while (lastQueryIds.length > 0);

    if (includeSelf) {
      allSubIds.push(parentId);
    }

    return uniq(allSubIds);
  },
};
