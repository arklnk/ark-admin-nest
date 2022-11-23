import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { SysRoleRepository } from '/@/repositories/sys-role.repository';
import { AppConfigService } from '/@/shared/services/app-config.service';

@Injectable()
export class SystemRoleService extends AbstractService {
  constructor(
    private readonly configService: AppConfigService,
    @InjectRepository(SysRoleEntity)
    private readonly sysRoleRepo: SysRoleRepository,
  ) {
    super();
  }

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

    // 无法删除被使用的角色，超级管理员角色不计入使用范围
    const countUse = await this.entityManager
      .createQueryBuilder(SysUserEntity, 'user')
      .where('JSON_CONTAINS(user.role_ids, JSON_ARRAY(:id))', { id: roleId })
      .andWhere('user.id != :rootId', {
        rootId: this.configService.appConfig.rootUserId,
      })
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

    // 查找未修改前角色ID所有的子项，防止将父级菜单修改成自己的子项导致数据丢失
    const allSubRoleIds: number[] = await this.sysRoleRepo.findAllSubIds([
      item.id,
    ]);

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
    }
  }
}
