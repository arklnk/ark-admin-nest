import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { uniq } from 'lodash';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../common/abstract.repository';
import { TREE_ROOT_NODE_ID } from '../constants/core';
import { SysPermMenuEntity } from '../entities/sys-perm-menu.entity';

@Injectable()
export class SysPermMenuRepository extends AbstractRepository<SysPermMenuEntity> {
  constructor(
    @InjectRepository(SysPermMenuEntity)
    repository: Repository<SysPermMenuEntity>,
  ) {
    super(repository);
  }

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
      const queryIds = await this.repository
        .createQueryBuilder('pm')
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
  }
}
