import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { uniq } from 'lodash';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../common/abstract.repository';
import { TREE_ROOT_NODE_ID } from '../constants/core';
import { StatusTypeEnum } from '../constants/type';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';

@Injectable()
export class SysDeptRepository extends AbstractRepository<SysDeptEntity> {
  constructor(
    @InjectRepository(SysDeptEntity) repository: Repository<SysDeptEntity>,
  ) {
    super(repository);
  }

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
      const queryIds = await this.repository
        .createQueryBuilder('dept')
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
  }

  async findDeptEnableByid(deptId: number): Promise<boolean> {
    const deptInfo = await this.repository.findOne({
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
      const ret = await this.repository.findOne({
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
  }
}
