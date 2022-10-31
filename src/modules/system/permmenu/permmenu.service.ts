import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { isEmpty, omit, uniq } from 'lodash';
import { In } from 'typeorm';
import {
  SysPermMenuAddReqDto,
  SysPermMenuDeleteReqDto,
  SysPermMenuItemRespDto,
} from './permmenu.dto';
import { AbstractService } from '/@/common/abstract.service';
import { UserPermCachePrefix, UserRoleCahcePrefix } from '/@/constants/cache';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { ErrorEnum } from '/@/constants/errorx';
import { BoolTypeEnum, SysMenuTypeEnum } from '/@/constants/type';
import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { AuthInspectService } from '/@/shared/services/auth-inspect.service';

@Injectable()
export class SystemPermMenuService extends AbstractService {
  constructor(
    private inspectService: AuthInspectService,
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
    const isSuperAdmin = await this.inspectService.inspectSuperAdmin(uid);
    if (isSuperAdmin) {
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
      throw new ApiFailedException(ErrorEnum.ForbiddenErrorCode);
    }

    // 检查是否有含有子项
    const count = await this.entityManager.count(SysPermMenuEntity, {
      where: {
        parentId: item.id,
      },
    });
    if (count > 0) {
      throw new ApiFailedException(ErrorEnum.DeletePermMenuErrorCode);
    }

    // 判断用户是否具备该权限才可进行删除操作
    const isSuperAdmin = await this.inspectService.inspectSuperAdmin(uid);
    let hasDeleteOperate = true;

    if (!isSuperAdmin) {
      const permmenuIds = await this.getUserPermMenuIds(uid);
      hasDeleteOperate = permmenuIds.includes(item.id);
    }

    if (!isSuperAdmin && !hasDeleteOperate) {
      throw new ApiFailedException(ErrorEnum.NotPermMenuErrorCode);
    }

    await this.entityManager.delete(SysPermMenuEntity, { id: item.id });
  }

  async addPermMenu(uid: number, item: SysPermMenuAddReqDto): Promise<void> {
    const isExceed = await this.checkUserPermissionExceed(uid, item.perms);
    if (isExceed) {
      throw new ApiFailedException(ErrorEnum.NotPermMenuErrorCode);
    }

    // 检查parentId合法性
    if (item.parentId !== TREE_ROOT_NODE_ID) {
      const parent = await this.entityManager.findOne(SysPermMenuEntity, {
        select: ['id', 'type'],
        where: {
          id: item.parentId,
        },
      });

      if (isEmpty(parent)) {
        throw new ApiFailedException(ErrorEnum.ParentPermMenuIdErrorCode);
      }

      if (parent.type === SysMenuTypeEnum.Permission) {
        throw new ApiFailedException(ErrorEnum.SetParentTypeErrorCode);
      }
    }

    await this.entityManager.insert(SysPermMenuEntity, {
      ...omit(item, 'perms'),
      perms: JSON.stringify(item.perms),
    });
  }

  /**
   * 判断用户新增、更新权限时是否越级更新自己未拥有的权限
   */
  async checkUserPermissionExceed(
    uid: number,
    permissions: string[],
  ): Promise<boolean> {
    const isSuperAdmin = await this.inspectService.inspectSuperAdmin(uid);
    if (isSuperAdmin) return false;

    const cachePerms: string[] = JSON.parse(
      await this.redisService.getClient().get(`${UserPermCachePrefix}${uid}`),
    );

    return permissions.some((e) => !cachePerms.includes(e));
  }

  /**
   * 获取用户所有的权限菜单ID
   */
  async getUserPermMenuIds(uid: number): Promise<number[]> {
    const roleIdsStr = await this.redisService
      .getClient()
      .get(`${UserRoleCahcePrefix}${uid}`);

    const roleIds: number[] = JSON.parse(roleIdsStr);

    const rolesInfo = await this.entityManager.find(SysRoleEntity, {
      select: ['permmenuIds'],
      where: {
        id: In(roleIds),
      },
    });

    let userHasPermMenuIds: number[] = [];
    rolesInfo.forEach((e) => {
      userHasPermMenuIds.push(...e.permmenuIds);
    });
    userHasPermMenuIds = uniq(userHasPermMenuIds);

    return userHasPermMenuIds;
  }
}
