import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmpty, uniq } from 'lodash';
import { In, Repository } from 'typeorm';
import { AbstractRepository } from '../common/abstract.repository';
import { TREE_ROOT_NODE_ID } from '../constants/core';
import { StatusTypeEnum } from '../constants/type';
import { SysRoleEntity } from '../entities/sys-role.entity';

export type SysRoleEntityTreeNode = SysRoleEntity & {
  children?: SysRoleEntity[];
};

@Injectable()
export class SysRoleRepository extends AbstractRepository<SysRoleEntity> {
  constructor(
    @InjectRepository(SysRoleEntity) repository: Repository<SysRoleEntity>,
  ) {
    super(repository);
  }

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
      const queryIds = await this.repository
        .createQueryBuilder('role')
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
  }

  async findAllEnableIds(parentIds: number[]): Promise<number[]> {
    if (parentIds.includes(TREE_ROOT_NODE_ID)) {
      throw new Error('parent role ids cannot be set the root node');
    }

    const allIds: number[] = [];

    let allRoles: SysRoleEntityTreeNode[] = [];
    let lastQueryIds: number[] = [...parentIds];

    do {
      const result = await this.repository
        .createQueryBuilder('role')
        .select(['role.id', 'role.parentId', 'role.status'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      // ???????????????ID???????????????ID????????????????????????
      const filterRoles = result.filter(
        (e) => !lastQueryIds.includes(e.id) && !allRoles.includes(e),
      );

      lastQueryIds = filterRoles.map((e) => e.id);
      allRoles.push(...filterRoles);
    } while (lastQueryIds.length > 0);

    // ??????????????????????????????
    const parentRoles = await this.repository.find({
      select: ['id', 'parentId', 'status'],
      where: {
        id: In(parentIds),
      },
    });

    // ??????
    allRoles = allRoles.concat(parentRoles);

    // ??????????????????????????????????????????????????????????????????????????????
    // ????????????????????????????????????????????????????????????????????????????????????????????????
    const rolesTree: SysRoleEntityTreeNode[] = [];
    const nodeMap = new Map<number, SysRoleEntityTreeNode>();

    for (const r of allRoles) {
      r.children = r.children || [];
      nodeMap.set(r.id, r);
    }

    for (const r of allRoles) {
      const parent = nodeMap.get(r.parentId);
      if (r.status === StatusTypeEnum.Enable) {
        (parent ? parent.children : rolesTree).push(r);
      }
    }

    // ???????????????????????????ROOT????????????????????????????????????????????????????????????????????????????????????
    // ?????????????????????????????????????????????
    const parentRecordMap = new Map<number, number>();
    lastQueryIds = rolesTree
      .filter((e) => e.parentId !== TREE_ROOT_NODE_ID)
      .map((e) => {
        parentRecordMap.set(e.parentId, e.id);
        return e.parentId;
      });

    do {
      const result = await this.repository
        .createQueryBuilder('role')
        .select(['role.id', 'role.parentId', 'role.status'])
        .where('FIND_IN_SET(id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      // lastQueryIds = result.map((e) => e.parentId);
      lastQueryIds = [];

      result.forEach((e) => {
        const treeId = parentRecordMap.get(e.parentId);
        parentRecordMap.delete(e.parentId);

        if (e.status === StatusTypeEnum.Disable) {
          const treeIndex = rolesTree.findIndex((e) => e.id === treeId);
          rolesTree.splice(treeIndex + 1, 1);
        }

        if (
          e.parentId !== TREE_ROOT_NODE_ID &&
          e.status !== StatusTypeEnum.Disable
        ) {
          lastQueryIds.push(e.parentId);
          parentRecordMap.set(e.parentId, treeId);
        }
      });
    } while (lastQueryIds.length > 0);

    // ????????????????????????????????????????????????ID
    for (let i = 0; i < rolesTree.length; i++) {
      allIds.push(rolesTree[i].id);

      !isEmpty(rolesTree[i]) &&
        rolesTree.splice(i + 1, 0, ...rolesTree[i].children);
    }

    return uniq(allIds);
  }
}
