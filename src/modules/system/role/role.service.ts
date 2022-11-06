import { Injectable } from '@nestjs/common';
import { isEmpty, omit } from 'lodash';
import {
  SysRoleAddReqDto,
  SysRoleListItemRespDto,
  SysRoleUpdateReqDto,
} from './role.dto';
import { AbstractService } from '/@/common/abstract.service';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { ErrorEnum } from '/@/constants/errorx';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';

@Injectable()
export class SystemRoleService extends AbstractService {
  async getRoleByList() {
    const roles = await this.entityManager.find(SysRoleEntity);
    return roles.map((e) => new SysRoleListItemRespDto(e)).toList();
  }

  async deleteRole(roleId: number): Promise<void> {
    const countChild = await this.entityManager.count(SysRoleEntity, {
      where: {
        parentId: roleId,
      },
    });

    if (countChild > 0) {
      throw new ApiFailedException(ErrorEnum.DeleteRoleErrorCode);
    }

    const countUse = await this.entityManager
      .createQueryBuilder(SysUserEntity, 'user')
      .where('JSON_CONTAINS(user.role_ids, JSON_ARRAY(:id))', { id: roleId })
      .getCount();

    if (countUse > 0) {
      throw new ApiFailedException(ErrorEnum.RoleIsUsingErrorCode);
    }

    await this.entityManager.delete(SysRoleEntity, { id: roleId });
  }

  async addRole(item: SysRoleAddReqDto): Promise<void> {
    if (item.parentId !== TREE_ROOT_NODE_ID) {
      const parent = await this.entityManager.findOne(SysRoleEntity, {
        select: ['id'],
        where: {
          id: item.parentId,
        },
      });

      if (isEmpty(parent)) {
        throw new ApiFailedException(ErrorEnum.ParentRoleIdErrorCode);
      }
    }

    await this.entityManager.insert(SysRoleEntity, item);
  }

  async updateRole(item: SysRoleUpdateReqDto): Promise<void> {
    if (item.parentId !== TREE_ROOT_NODE_ID) {
      const parent = await this.entityManager.findOne(SysRoleEntity, {
        select: ['id'],
        where: {
          id: item.parentId,
        },
      });

      if (isEmpty(parent)) {
        throw new ApiFailedException(ErrorEnum.ParentRoleIdErrorCode);
      }
    }

    if (item.id === item.parentId) {
      throw new ApiFailedException(ErrorEnum.ParentRoleErrorCode);
    }

    // 查找未修改前角色ID所有的子项，防止将父级菜单修改成自己的子项导致数据丢失
    let lastQueryIds: number[] = [item.id];
    const allSubRoleIds: number[] = [];

    do {
      const pmIds = await this.entityManager
        .createQueryBuilder(SysRoleEntity, 'role')
        .select(['role.id'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      lastQueryIds = pmIds.map((e) => e.id);
      allSubRoleIds.push(...lastQueryIds);
    } while (lastQueryIds.length > 0);

    if (allSubRoleIds.includes(item.parentId)) {
      throw new ApiFailedException(ErrorEnum.SetParentIdErrorCode);
    }

    await this.entityManager.update(
      SysRoleEntity,
      { id: item.id },
      {
        ...omit(item, 'id'),
      },
    );
  }
}
