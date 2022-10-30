import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { isEmpty, uniq } from 'lodash';
import { In } from 'typeorm';
import { SysPermMenuItemRespDto } from './permmenu.dto';
import { AbstractService } from '/@/common/abstract.service';
import { UserRoleCahcePrefix } from '/@/constants/cache';
import { BoolTypeEnum } from '/@/constants/type';
import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { AppConfigService } from '/@/shared/services/app-config.service';

@Injectable()
export class SystemPermMenuService extends AbstractService {
  constructor(
    private configService: AppConfigService,
    private redisService: RedisService,
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
    const user = await this.entityManager.findOne(SysUserEntity, {
      select: ['roleIds'],
      where: {
        id: uid,
      },
    });
    if (isEmpty(user)) {
      throw new Error(`user id: ${uid} is not exists`);
    }
    if (user.roleIds.includes(this.configService.appConfig.rootRoleId)) {
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
}
