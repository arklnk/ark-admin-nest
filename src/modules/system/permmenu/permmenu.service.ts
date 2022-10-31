import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { uniq } from 'lodash';
import { In } from 'typeorm';
import {
  SysPermMenuDeleteReqDto,
  SysPermMenuItemRespDto,
} from './permmenu.dto';
import { AbstractService } from '/@/common/abstract.service';
import { UserRoleCahcePrefix } from '/@/constants/cache';
import { ErrorEnum } from '/@/constants/errorx';
import { BoolTypeEnum } from '/@/constants/type';
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

    // super admin does not cache the role ids
    // need to query the admin identity
    const isSuperAdmin = await this.inspectService.inspectSuperAdmin(uid);
    if (isSuperAdmin) {
      return permmenus
        .map((e) => new SysPermMenuItemRespDto(e, BoolTypeEnum.True))
        .toList();
    }

    // get cache role id
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
    // check is protect id
    if (item.id <= this.configService.appConfig.protectSysPermMenuMaxId) {
      throw new ApiFailedException(ErrorEnum.ForbiddenErrorCode);
    }

    // check has children
    const count = await this.entityManager.count(SysPermMenuEntity, {
      where: {
        parentId: item.id,
      },
    });
    if (count > 0) {
      throw new ApiFailedException(ErrorEnum.DeletePermMenuErrorCode);
    }

    // check user has permmenu id to delete
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
