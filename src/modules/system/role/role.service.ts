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
import { StatusTypeEnum } from '/@/constants/type';
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
      throw new ApiFailedException(ErrorEnum.CODE_1105);
    }

    const countUse = await this.entityManager
      .createQueryBuilder(SysUserEntity, 'user')
      .where('JSON_CONTAINS(user.role_ids, JSON_ARRAY(:id))', { id: roleId })
      .getCount();

    if (countUse > 0) {
      throw new ApiFailedException(ErrorEnum.CODE_1106);
    }

    await this.entityManager.delete(SysRoleEntity, { id: roleId });
  }

  async addRole(item: SysRoleAddReqDto): Promise<void> {
    await this.checkParentRoleInvalid(item.parentId);

    await this.entityManager.insert(SysRoleEntity, item);
  }

  async updateRole(item: SysRoleUpdateReqDto): Promise<void> {
    await this.checkParentRoleInvalid(item.parentId);

    if (item.id === item.parentId) {
      throw new ApiFailedException(ErrorEnum.CODE_1107);
    }

    // 如果需要禁用当前角色，则需要判断当前子角色下是否全被禁用
    if (item.status === StatusTypeEnum.Disable) {
      const countEnable = await this.entityManager.count(SysRoleEntity, {
        where: {
          parentId: item.id,
          status: StatusTypeEnum.Enable,
        },
      });

      if (countEnable) {
        throw new ApiFailedException(ErrorEnum.CODE_1108);
      }
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
      throw new ApiFailedException(ErrorEnum.CODE_1109);
    }

    await this.entityManager.update(
      SysRoleEntity,
      { id: item.id },
      {
        ...omit(item, 'id'),
      },
    );
  }

  /**
   * 检查父级角色是否存在或是否被禁用，是则抛出异常
   */
  private async checkParentRoleInvalid(pid: number): Promise<void> {
    if (pid !== TREE_ROOT_NODE_ID) {
      const parent = await this.entityManager.findOne(SysRoleEntity, {
        select: ['id', 'status'],
        where: {
          id: pid,
        },
      });

      if (isEmpty(parent)) {
        throw new ApiFailedException(ErrorEnum.CODE_1110);
      }

      if (parent.status === StatusTypeEnum.Disable) {
        throw new ApiFailedException(ErrorEnum.CODE_1111);
      }
    }
  }
}
