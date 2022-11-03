import type { SysRoleEntityTreeNode } from './user.interface';
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
  UserAvatarGenerateRespDto,
  UserInfoRespDto,
  UserLoginCaptchaRespDto,
  UserLoginReqDto,
  UserLoginRespDto,
  UserPasswordUpdateReqDto,
  UserPermMenuRespDto,
  UserPermRespItemDto,
  UserProfileInfoRespDto,
  UserProfileUpdateReqDto,
} from './user.dto';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { isEmpty, omit, uniq } from 'lodash';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { SysLogEntity } from '/@/entities/sys-log.entity';
import {
  StatusTypeEnum,
  SysLogTypeEnum,
  SysMenuTypeEnum,
} from '/@/constants/type';
import { ErrorEnum } from '/@/constants/errorx';
import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { In } from 'typeorm';
import { AvatarGenerator } from '/@/providers/avatar-generator';
import { AppGeneralService } from '/@/shared/services/app-general.service';

@Injectable()
export class UserService extends AbstractService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: AppConfigService,
    private generalService: AppGeneralService,
  ) {
    super();
  }

  async createLoginCaptcha(
    width?: number,
    height?: number,
  ): Promise<UserLoginCaptchaRespDto> {
    const svg = SvgCaptcha.create({
      color: true,
      size: 4,
      noise: 4,
      width: width ?? 100,
      height: height ?? 40,
      charPreset: '1234567890',
    });

    const captcha = new UserLoginCaptchaRespDto(
      `data:image/svg+xml;base64,${Buffer.from(svg.data).toString('base64')}`,
      buildShortUUID(),
    );

    await this.redisService
      .getClient()
      .set(
        `${UserLoginCaptchaCachePrefix}${captcha.captchaId}`,
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
  ): Promise<UserLoginRespDto> {
    // check captcha is invalid
    const captchaKey = `${UserLoginCaptchaCachePrefix}${dto.captchaId}`;
    const captcha = await this.redisService.getClient().get(captchaKey);
    if (isEmpty(captcha) || dto.verifyCode !== captcha) {
      throw new ApiFailedException(ErrorEnum.CaptchaErrorCode);
    }

    // find user by account
    const user = await this.entityManager.findOne(SysUserEntity, {
      select: ['account', 'password', 'id', 'status'],
      where: { account: dto.account },
    });

    if (isEmpty(user)) {
      throw new ApiFailedException(ErrorEnum.AccountErrorCode);
    }

    // check password
    const encryPwd = this.generalService.generateUserPassword(dto.password);
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
    await this.entityManager.insert(SysLogEntity, {
      userId: user.id,
      status: StatusTypeEnum.Successful,
      type: SysLogTypeEnum.Login,
      ip,
      uri,
      request: JSON.stringify(omit(dto, 'password')),
    });

    return new UserLoginRespDto(token);
  }

  async getUserPermMenu(uid: number): Promise<UserPermMenuRespDto> {
    const token = await this.redisService
      .getClient()
      .get(`${UserOnlineCachePrefix}${uid}`);

    if (isEmpty(token)) {
      throw new ApiFailedException(ErrorEnum.AuthErrorCode);
    }

    const user = await this.entityManager.findOne(SysUserEntity, {
      where: { id: uid },
    });

    // 如果是超级管理员则直接返回所有的权限菜单
    if (this.generalService.isRootUser(uid)) {
      const pms = await this.entityManager.find(SysPermMenuEntity, {
        order: {
          orderNum: 'DESC',
        },
      });

      // 缓存权限用于权限中间件
      const result = this.splitPermAndMenu(pms);
      await this.redisService
        .getClient()
        .set(`${UserPermCachePrefix}${user.id}`, JSON.stringify(result.perms));
      return result;
    }

    // 查询用户所拥有的的角色，包括子角色（父角色会拥有所有的子级角色权限）
    let allSubRoles: number[] = [];

    const roleIdCache = await this.redisService
      .getClient()
      .get(`${UserRoleCahcePrefix}${user.id}`);

    // 判断是否存在缓存
    if (isEmpty(roleIdCache)) {
      let lastQueryIds: number[] = [].concat(user.roleIds);
      allSubRoles = [].concat(user.roleIds);

      do {
        const roleids = await this.entityManager
          .createQueryBuilder(SysRoleEntity, 'role')
          .select(['role.id'])
          .where('FIND_IN_SET(parent_id, :ids)', {
            ids: lastQueryIds.join(','),
          })
          .getMany();

        lastQueryIds = roleids.map((e) => e.id);
        allSubRoles.push(...lastQueryIds);
      } while (lastQueryIds.length > 0);

      // 移除重复id
      allSubRoles = uniq(allSubRoles);

      // 缓存角色，用以优化后续查询
      await this.redisService
        .getClient()
        .set(`${UserRoleCahcePrefix}${user.id}`, JSON.stringify(allSubRoles));
    } else {
      allSubRoles = JSON.parse(roleIdCache);
    }

    // 查找相关的角色信息
    const roles = await this.entityManager.find<SysRoleEntityTreeNode>(
      SysRoleEntity,
      {
        select: ['status', 'id', 'parentId', 'permmenuIds'],
        where: {
          id: In(allSubRoles),
        },
      },
    );

    // 过滤禁用的角色
    // 如果父级角色被禁用，那么相对应的子角色也会被全部禁用
    const rolesTree: SysRoleEntityTreeNode[] = [];
    const nodeMap = new Map<number, SysRoleEntityTreeNode>();

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

    // 处理过滤后的角色所拥有的权限菜单编号
    let permmenuIds: number[] = [];

    for (let i = 0; i < rolesTree.length; i++) {
      permmenuIds.push(...rolesTree[i].permmenuIds);

      !isEmpty(rolesTree[i]) &&
        rolesTree.splice(i + 1, 0, ...rolesTree[i].children);
    }

    // 移除重复编号
    permmenuIds = uniq(permmenuIds);

    // 获取权限菜单信息
    const pms = await this.entityManager.find(SysPermMenuEntity, {
      where: {
        id: In(permmenuIds),
      },
      order: {
        orderNum: 'DESC',
      },
    });

    // 缓存权限
    const result = this.splitPermAndMenu(pms);
    await this.redisService
      .getClient()
      .set(`${UserPermCachePrefix}${user.id}`, JSON.stringify(result.perms));
    return result;
  }

  /**
   * 分离权限以及菜单
   */
  private splitPermAndMenu(permmenu: SysPermMenuEntity[]): UserPermMenuRespDto {
    const menus: UserPermRespItemDto[] = [];
    const perms: string[] = [];

    permmenu.forEach((e) => {
      if (e.type === SysMenuTypeEnum.Permission) {
        perms.push(...(JSON.parse(e.perms) as string[]));
      } else {
        menus.push(new UserPermRespItemDto(e));
      }
    });

    return new UserPermMenuRespDto(menus, uniq(perms));
  }

  async userLogout(uid: number): Promise<void> {
    const keys = [
      UserOnlineCachePrefix,
      UserPermCachePrefix,
      UserRoleCahcePrefix,
    ].map((e) => `${e}${uid}`);

    await this.redisService.getClient().del(keys);
  }

  async getUserProfileInfo(uid: number): Promise<UserProfileInfoRespDto> {
    const user = await this.entityManager.findOne(SysUserEntity, {
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

    return new UserProfileInfoRespDto(user);
  }

  async getUserInfo(uid: number): Promise<UserInfoRespDto> {
    const user = await this.entityManager.findOne(SysUserEntity, {
      select: ['username', 'avatar'],
      where: { id: uid },
    });

    return new UserInfoRespDto(user);
  }

  generateAvatar(): UserAvatarGenerateRespDto {
    const g = new AvatarGenerator();
    return new UserAvatarGenerateRespDto(g.generate());
  }

  async updateUserProfileInfo(
    uid: number,
    body: UserProfileUpdateReqDto,
  ): Promise<void> {
    await this.entityManager.update(
      SysUserEntity,
      {
        id: uid,
      },
      body,
    );
  }

  async updateUserPassword(
    uid: number,
    body: UserPasswordUpdateReqDto,
  ): Promise<void> {
    const user = await this.entityManager.findOne(SysUserEntity, {
      select: ['password'],
      where: {
        id: uid,
      },
    });

    const oldPasswordCipher = this.generalService.generateUserPassword(
      body.oldPassword,
    );

    if (user.password !== oldPasswordCipher) {
      throw new ApiFailedException(ErrorEnum.PasswordErrorCode);
    }

    const newPasswordCipher = this.generalService.generateUserPassword(
      body.newPassword,
    );

    await this.entityManager.update(
      SysUserEntity,
      { id: uid },
      { password: newPasswordCipher },
    );
  }
}
