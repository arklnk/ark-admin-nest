import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { isEmpty, omit, uniq } from 'lodash';
import { In } from 'typeorm';
import {
  SysPermMenuAddReqDto,
  SysPermMenuDeleteReqDto,
  SysPermMenuItemRespDto,
  SysPermMenuUpdateReqDto,
} from './permmenu.dto';
import { AbstractService } from '/@/common/abstract.service';
import { UserPermCachePrefix } from '/@/constants/cache';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { ErrorEnum } from '/@/constants/errorx';
import {
  BoolTypeEnum,
  StatusTypeEnum,
  SysMenuTypeEnum,
} from '/@/constants/type';
import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { AppGeneralService } from '/@/shared/services/app-general.service';

@Injectable()
export class SystemPermMenuService extends AbstractService {
  constructor(
    private generalService: AppGeneralService,
    private redisService: RedisService,
    private configService: AppConfigService,
  ) {
    super();
  }

  async getPermMenuByList(uid: number) {
    const permmenus = await this.entityManager.find(SysPermMenuEntity, {
      select: [
        'activeRouter',
        'icon',
        'id',
        'isShow',
        'name',
        'orderNum',
        'parentId',
        'perms',
        'router',
        'type',
        'viewPath',
      ],
    });

    // 查找用户具备的菜单权限
    // 如果为超级管理员则直接返回
    if (this.generalService.isRootUser(uid)) {
      return permmenus
        .map((e) => new SysPermMenuItemRespDto(e, BoolTypeEnum.True))
        .toList();
    }

    const userHasPermMenuIds: number[] = await this.getUserPermMenuIds(uid);

    return permmenus
      .map((e) => {
        const has = userHasPermMenuIds.includes(e.id)
          ? BoolTypeEnum.True
          : BoolTypeEnum.False;
        return new SysPermMenuItemRespDto(e, has);
      })
      .toList();
  }

  async deletePermMenu(
    uid: number,
    item: SysPermMenuDeleteReqDto,
  ): Promise<void> {
    // 检查是否为保护的保护的菜单ID
    if (item.id <= this.configService.appConfig.protectSysPermMenuMaxId) {
      throw new ApiFailedException(ErrorEnum.CODE_1112);
    }

    // 检查是否有含有子项
    const count = await this.entityManager.count(SysPermMenuEntity, {
      where: {
        parentId: item.id,
      },
    });

    if (count > 0) {
      throw new ApiFailedException(ErrorEnum.CODE_1113);
    }

    // 判断用户是否在该权限菜单的管理范围内才可进行删除操作
    let hasDeleteOperate = true;

    if (!this.generalService.isRootUser(uid)) {
      const permmenuIds = await this.getUserPermMenuIds(uid);
      hasDeleteOperate = permmenuIds.includes(item.id);
    }

    if (!hasDeleteOperate) {
      throw new ApiFailedException(ErrorEnum.CODE_1114);
    }

    await this.entityManager.delete(SysPermMenuEntity, { id: item.id });
  }

  async addPermMenu(uid: number, item: SysPermMenuAddReqDto): Promise<void> {
    await this.checkUserPermissionExceed(uid, item.perms);

    await this.checkPermMenuParentInvalid(item.parentId);

    await this.entityManager.insert(SysPermMenuEntity, {
      ...omit(item, 'perms'),
      perms: JSON.stringify(item.perms),
    });
  }

  async updatePermMenu(
    uid: number,
    item: SysPermMenuUpdateReqDto,
  ): Promise<void> {
    // 检查是否为保护的保护的菜单ID
    if (item.id <= this.configService.appConfig.protectSysPermMenuMaxId) {
      throw new ApiFailedException(ErrorEnum.CODE_1112);
    }

    await this.checkUserPermissionExceed(uid, item.perms);

    if (item.id === item.parentId) {
      throw new ApiFailedException(ErrorEnum.CODE_1115);
    }

    await this.checkPermMenuParentInvalid(item.parentId);

    // 查找未修改前权限菜单ID所有的子项，防止将父级菜单修改成自己的子项导致数据丢失
    let lastQueryIds: number[] = [item.id];
    let allSubPermMenuIds: number[] = [];

    do {
      const pmIds = await this.entityManager
        .createQueryBuilder(SysPermMenuEntity, 'perm_menu')
        .select(['perm_menu.id'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      lastQueryIds = pmIds.map((e) => e.id);
      allSubPermMenuIds.push(...lastQueryIds);
    } while (lastQueryIds.length > 0);

    // 查重
    allSubPermMenuIds = uniq(allSubPermMenuIds);

    if (allSubPermMenuIds.includes(item.parentId)) {
      throw new ApiFailedException(ErrorEnum.CODE_1116);
    }

    await this.entityManager.update(
      SysPermMenuEntity,
      { id: item.id },
      {
        ...omit(item, ['id', 'perms']),
        perms: JSON.stringify(item.perms),
      },
    );
  }

  /**
   * 检查父级权限菜单ID合法性，不存在或权限不能作为父级菜单
   */
  private async checkPermMenuParentInvalid(pid: number): Promise<void> {
    if (pid === TREE_ROOT_NODE_ID) return;

    const parent = await this.entityManager.findOne(SysPermMenuEntity, {
      select: ['id', 'type'],
      where: {
        id: pid,
      },
    });

    if (isEmpty(parent)) {
      throw new ApiFailedException(ErrorEnum.CODE_1117);
    }

    if (parent.type === SysMenuTypeEnum.Permission) {
      throw new ApiFailedException(ErrorEnum.CODE_1118);
    }
  }

  /**
   * 判断用户新增、更新权限时是否越级更新自己未拥有的权限
   */
  private async checkUserPermissionExceed(
    uid: number,
    permissions: string[],
  ): Promise<void> {
    if (this.generalService.isRootUser(uid)) return;

    const cachePerms: string[] = JSON.parse(
      await this.redisService.getClient().get(`${UserPermCachePrefix}${uid}`),
    );

    const exceed = permissions.some((e) => !cachePerms.includes(e));

    if (exceed) {
      throw new ApiFailedException(ErrorEnum.CODE_1114);
    }
  }

  /**
   * 获取用户所有的权限菜单ID
   */
  private async getUserPermMenuIds(uid: number): Promise<number[]> {
    const user = await this.entityManager.findOne(SysUserEntity, {
      select: ['roleIds'],
      where: {
        id: uid,
      },
    });

    const roleIds = await this.getAllSubRoleIds(user.roleIds);

    const rolesInfo = await this.entityManager.find(SysRoleEntity, {
      select: ['permMenuIds'],
      where: {
        id: In(roleIds),
        status: StatusTypeEnum.Enable,
      },
    });

    let userHasPermMenuIds: number[] = [];
    rolesInfo.forEach((e) => {
      userHasPermMenuIds.push(...e.permMenuIds);
    });
    userHasPermMenuIds = uniq(userHasPermMenuIds);

    return userHasPermMenuIds;
  }

  /**
   * 给定角色数组查找所有的子角色ID包括自身
   */
  private async getAllSubRoleIds(roleIds: number[]): Promise<number[]> {
    let allSubRoles: number[] = [...roleIds];
    let lastQueryIds: number[] = [...roleIds];

    do {
      const roleids = await this.entityManager
        .createQueryBuilder(SysRoleEntity, 'role')
        .select(['role.id'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      lastQueryIds = roleids
        .map((e) => e.id)
        .filter((e) => !lastQueryIds.includes(e) && !allSubRoles.includes(e));

      allSubRoles.push(...lastQueryIds);
    } while (lastQueryIds.length > 0);

    // 移除重复id
    allSubRoles = uniq(allSubRoles);

    return allSubRoles;
  }
}
