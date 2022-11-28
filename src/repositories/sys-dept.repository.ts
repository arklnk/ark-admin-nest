import { Provider } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { uniq } from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { TREE_ROOT_NODE_ID } from '../constants/core';
import { StatusTypeEnum } from '../constants/type';
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

  /**
   * 查找部门是否可用
   */
  findDeptEnableByid(
    this: Repository<SysDeptEntity>,
    deptId: number,
  ): Promise<boolean>;
}

export const extendsSysDeptRepository: Pick<
  SysDeptRepository,
  'findAllSubIds' | 'findDeptEnableByid'
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

  async findDeptEnableByid(deptId: number): Promise<boolean> {
    const deptInfo = await this.findOne({
      select: ['id', 'parentId', 'status'],
      where: {
        id: deptId,
      },
    });

    if (deptInfo.parentId === TREE_ROOT_NODE_ID) {
      return deptInfo.status === StatusTypeEnum.Enable;
    }

    let parentId = deptInfo.parentId;

    while (parentId !== TREE_ROOT_NODE_ID) {
      const ret = await this.findOne({
        select: ['id', 'parentId', 'status'],
        where: {
          id: deptInfo.parentId,
        },
      });

      if (ret.status === StatusTypeEnum.Disable) {
        return false;
      }

      parentId = ret.parentId;
    }

    return true;
  },
};
