import { Provider } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { uniq } from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { TREE_ROOT_NODE_ID } from '../constants/core';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';

export const SysDeptRepositoryProvider: Provider = {
  provide: getRepositoryToken(SysDeptEntity),
  inject: [getDataSourceToken()],
  useFactory: (datasrouce: DataSource) => {
    return datasrouce
      .getRepository(SysDeptEntity)
      .extend(extendsSysDeptRepository);
  },
};

export interface SysDeptRepository extends Repository<SysDeptEntity> {
  /**
   * 查找当前父级的所有子级部门编号
   */
  findAllSubIds(
    this: Repository<SysDeptEntity>,
    parentId: number,
    includeSelf?: boolean,
  ): Promise<number[]>;
}

export const extendsSysDeptRepository: Pick<
  SysDeptRepository,
  'findAllSubIds'
> = {
  async findAllSubIds(
    parentId: number,
    includeSelf = false,
  ): Promise<number[]> {
    if (parentId === TREE_ROOT_NODE_ID) {
      throw new Error('parent dept id cannot be set the root node');
    }

    const allSubIds: number[] = [];
    let lastQueryIds: number[] = [parentId];

    do {
      const queryIds = await this.createQueryBuilder('dept')
        .select(['dept.id'])
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
