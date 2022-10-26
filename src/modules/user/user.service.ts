import type { SysRoleTreeNode } from './user.interface';
import type { IAuthUser } from '/@/interfaces/auth';

import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as SvgCaptcha from 'svg-captcha';
import { buildShortUUID } from '/@/common/utils/uuid';
import {
  UserLoginCaptchaCachePrefix,
  UserOnlineCachePrefix,
  UserPermCachePrefix,
  UserRoleCahcePrefix,
} from '/@/constants/cache';
import { AbstractService } from '/@/common/abstract.service';
import {
  UserLoginCaptchaResDto,
  UserLoginReqDto,
  UserLoginResDto,
  UserPermMenuResDto,
} from './user.dto';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { isEmpty, omit, uniq } from 'lodash';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { SysUser } from '/@/entities/sys-user.entity';
import { encryptByMD5 } from '/@/common/utils/cipher';
import { SysLog } from '/@/entities/sys-log.entity';
import {
  StatusTypeEnum,
  SysLogTypeEnum,
  SysMenuTypeEnum,
} from '/@/constants/type';
import { ErrorEnum } from '/@/constants/errorx';
import { SysPermMenu } from '/@/entities/sys-perm-menu.entity';
import { SysRole } from '/@/entities/sys-role.entity';
import { In } from 'typeorm';

@Injectable()
export class UserService extends AbstractService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: AppConfigService,
  ) {
    super();
  }

  async createLoginCaptcha(
    width?: number,
    height?: number,
  ): Promise<UserLoginCaptchaResDto> {
    const svg = SvgCaptcha.create({
      color: true,
      size: 4,
      noise: 4,
      width: width ?? 100,
      height: height ?? 40,
      charPreset: '1234567890',
    });

    const captcha = new UserLoginCaptchaResDto({
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        'base64',
      )}`,
      id: buildShortUUID(),
    });

    await this.redisService
      .getClient()
      .set(
        `${UserLoginCaptchaCachePrefix}${captcha.id}`,
        svg.text.toLowerCase(),
        'EX',
        60 * 5,
      );

    return captcha;
  }

  async createLoginToken(
    dto: UserLoginReqDto,
    ip: string,
    uri: string,
  ): Promise<UserLoginResDto> {
    // check captcha is invalid
    const captchaKey = `${UserLoginCaptchaCachePrefix}${dto.captchaId}`;
    const captcha = await this.redisService.getClient().get(captchaKey);
    if (isEmpty(captcha) || dto.verifyCode !== captcha) {
      throw new ApiFailedException(ErrorEnum.CaptchaErrorCode);
    }

    // find user by account
    const user = await this.entityManager.findOne(SysUser, {
      select: ['account', 'password', 'id', 'status'],
      where: { account: dto.account },
    });

    if (isEmpty(user)) {
      throw new ApiFailedException(ErrorEnum.AccountErrorCode);
    }

    // check password
    const encryPwd = encryptByMD5(
      `${dto.password}${this.configService.appConfig.userPwdSalt}`,
    );

    if (user.password !== encryPwd) {
      throw new ApiFailedException(ErrorEnum.PasswordErrorCode);
    }

    // check user status
    if (user.status === StatusTypeEnum.Disable) {
      throw new ApiFailedException(ErrorEnum.AccountDisableErrorCode);
    }

    // auth payload
    const payload: IAuthUser = { uid: user.id };
    const token = this.jwtService.sign(payload);
    const onlineKey = `${UserOnlineCachePrefix}${user.id}`;

    // set expires token
    await this.redisService
      .getClient()
      .set(onlineKey, token, 'EX', this.configService.jwtConfig.expires);

    // save login log
    await this.entityManager.insert(SysLog, {
      userId: user.id,
      status: StatusTypeEnum.Successful,
      type: SysLogTypeEnum.Login,
      ip,
      uri,
      request: JSON.stringify(omit(dto, 'password')),
    });

    return new UserLoginResDto({
      token,
    });
  }

  async getUserPermMenu(uid: number): Promise<UserPermMenuResDto> {
    const token = await this.redisService
      .getClient()
      .get(`${UserOnlineCachePrefix}${uid}`);

    if (isEmpty(token)) {
      throw new ApiFailedException(ErrorEnum.AuthErrorCode);
    }

    const user = await this.entityManager.findOne(SysUser, {
      where: { id: uid },
    });

    // super admin directly find all permission and menu
    if (user.roleIds.includes(this.configService.appConfig.rootRoleId)) {
      const pms = await this.entityManager.find(SysPermMenu, {
        order: {
          orderNum: 'DESC',
        },
      });

      // cache and return
      const result = this.splitPermAndMenu(pms);
      await this.redisService
        .getClient()
        .set(`${UserPermCachePrefix}${user.id}`, JSON.stringify(result.perms));
      return result;
    }

    // role is tree struct, must find all sub role ids
    let allSubRoles: number[] = [];

    const roleIdCache = await this.redisService
      .getClient()
      .get(`${UserRoleCahcePrefix}${user.id}`);

    // check whether there is a cache and read from the cache
    if (isEmpty(roleIdCache)) {
      let lastQueryIds: number[] = [].concat(user.roleIds);
      allSubRoles = [].concat(user.roleIds);

      do {
        const roleids = await this.entityManager
          .createQueryBuilder(SysRole, 'role')
          .select(['role.id'])
          .where('FIND_IN_SET(parent_id, :ids)', {
            ids: lastQueryIds.join(','),
          })
          .getMany();

        lastQueryIds = roleids.map((e) => e.id);
        allSubRoles.push(...lastQueryIds);
      } while (lastQueryIds.length > 0);

      // removing duplicate ids
      allSubRoles = uniq(allSubRoles);

      // cache role ids
      await this.redisService
        .getClient()
        .set(`${UserRoleCahcePrefix}${user.id}`, JSON.stringify(allSubRoles));
    } else {
      allSubRoles = JSON.parse(roleIdCache);
    }

    // find relation role info
    const roles = await this.entityManager.find<SysRoleTreeNode>(SysRole, {
      select: ['status', 'id', 'parentId', 'permmenuIds'],
      where: {
        id: In(allSubRoles),
      },
    });

    // filter disabled roles.
    // if the parent is disabled, then all children are also disabled
    // list to tree to delete disable node
    const rolesTree: SysRoleTreeNode[] = [];
    const nodeMap = new Map<number, SysRoleTreeNode>();

    for (const r of roles) {
      r.children = r.children || [];
      nodeMap.set(r.id, r);
    }

    for (const r of roles) {
      const parent = nodeMap.get(r.parentId);
      if (r.status === StatusTypeEnum.Enable) {
        (parent ? parent.children : rolesTree).push(r);
      }
    }

    // after filtering, obtain all permission menu ids
    let permmenuIds: number[] = [];

    for (let i = 0; i < rolesTree.length; i++) {
      permmenuIds.push(...rolesTree[i].permmenuIds);

      !isEmpty(rolesTree[i]) &&
        rolesTree.splice(i + 1, 0, ...rolesTree[i].children);
    }

    // removing duplicate ids
    permmenuIds = uniq(permmenuIds);

    // find permission and menu by role id
    const pms = await this.entityManager.find(SysPermMenu, {
      where: {
        id: In(permmenuIds),
      },
      order: {
        orderNum: 'DESC',
      },
    });

    // cache and return
    const result = this.splitPermAndMenu(pms);
    await this.redisService
      .getClient()
      .set(`${UserPermCachePrefix}${user.id}`, JSON.stringify(result.perms));
    return result;
  }

  /**
   * grouping permission and menu
   */
  private splitPermAndMenu(permmenu: SysPermMenu[]): UserPermMenuResDto {
    const menus: SysPermMenu[] = [];
    const perms: string[] = [];

    permmenu.forEach((e) => {
      if (e.type === SysMenuTypeEnum.Permission) {
        perms.push(...(JSON.parse(e.perms) as string[]));
      } else {
        menus.push(e);
      }
    });

    return new UserPermMenuResDto({
      menus,
      perms: uniq(perms),
    });
  }

  async userLogout(uid: number): Promise<void> {
    const keys = [
      UserOnlineCachePrefix,
      UserPermCachePrefix,
      UserRoleCahcePrefix,
    ].map((e) => `${e}${uid}`);

    await this.redisService.getClient().del(keys);
  }

  async getUserProfileInfo(uid: number): Promise<SysUser> {
    const user = await this.entityManager.findOne(SysUser, {
      select: [
        'username',
        'nickname',
        'gender',
        'email',
        'mobile',
        'remark',
        'avatar',
      ],
      where: { id: uid },
    });

    if (isEmpty(user)) {
      throw new Error(`user id: ${uid} does not exist`);
    }

    return user;
  }
}
