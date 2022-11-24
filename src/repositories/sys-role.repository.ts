import { Provider } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { isEmpty, uniq } from 'lodash';
import { DataSource, In, Repository } from 'typeorm';
import { TREE_ROOT_NODE_ID } from '../constants/core';
import { StatusTypeEnum } from '../constants/type';
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

  /**
   * 查找给定ID下所有可用角色编号
   * 查找所有的关联子角色ID -> 获取parentIds角色信息 -> 合并角色信息形成树 -> 获取树顶级节点不为Root -> 往上查找关联的父级节点 -> 最终合并树结构遍历获取可用ID
   */
  findAllEnableIds(
    this: Repository<SysRoleEntity>,
    parentIds: number[],
  ): Promise<number[]>;
}

export type SysRoleEntityTreeNode = SysRoleEntity & {
  children?: SysRoleEntity[];
};

export const extendsSysRoleRepository: Pick<
  SysRoleRepository,
  'findAllSubIds' | 'findAllEnableIds'
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

  async findAllEnableIds(parentIds: number[]): Promise<number[]> {
    if (parentIds.includes(TREE_ROOT_NODE_ID)) {
      throw new Error('parent role ids cannot be set the root node');
    }

    const allIds: number[] = [];

    let allRoles: SysRoleEntityTreeNode[] = [];
    let lastQueryIds: number[] = [...parentIds];

    do {
      const result = await this.createQueryBuilder('role')
        .select(['role.id', 'role.parentId', 'role.status'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      // 查重，避免ID列表里有子ID时又进行重复查询
      const filterRoles = result.filter(
        (e) => !lastQueryIds.includes(e.id) && !allRoles.includes(e),
      );

      lastQueryIds = filterRoles.map((e) => e.id);
      allRoles.push(...filterRoles);
    } while (lastQueryIds.length > 0);

    // 查询的条件的角色信息
    const parentRoles = await this.find({
      select: ['id', 'parentId', 'status'],
      where: {
        id: In(parentIds),
      },
    });

    // 合并
    allRoles = allRoles.concat(parentRoles);

    // 如果父级角色被禁用，那么相对应的子角色也会被全部禁用
    // 转换成树结构判断角色节点是否被禁用，被禁用则移除节点以及其子节点
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

    // 获取顶层节点且不为ROOT节点的角色，需要往上查找判断给予条件的父级编号是否被禁用
    // 如果被禁用，那么依然是被禁用的
    const parentRecordMap = new Map<number, number>();
    lastQueryIds = rolesTree
      .filter((e) => e.parentId !== TREE_ROOT_NODE_ID)
      .map((e) => {
        parentRecordMap.set(e.parentId, e.id);
        return e.parentId;
      });

    do {
      const result = await this.createQueryBuilder('role')
        .select(['role.id', 'role.parent_id', 'role.status'])
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

    // 最终结果遍历树获取所有可用的角色ID
    for (let i = 0; i < rolesTree.length; i++) {
      allIds.push(rolesTree[i].id);

      !isEmpty(rolesTree[i]) &&
        rolesTree.splice(i + 1, 0, ...rolesTree[i].children);
    }

    return uniq(allIds);
  },
};
