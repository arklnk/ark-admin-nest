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
import { SysDictionaryEntity } from '/@/entities/sys-dictionary.entity';
import { CONFIG_SYS_CH_PWD, CONFIG_SYS_USERINFO } from '/@/constants/core';
import { SysRoleRepository } from '/@/repositories/sys-role.repository';
import { SysDeptRepository } from '/@/repositories/sys-dept.repository';

@Injectable()
export class UserService extends AbstractService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: AppConfigService,
    private readonly generalService: AppGeneralService,
    private readonly sysRoleRepo: SysRoleRepository,
    private readonly sysDeptRepo: SysDeptRepository,
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
    // ???????????????????????????
    const captchaKey = `${UserLoginCaptchaCachePrefix}${dto.captchaId}`;
    const captcha = await this.redisService.getClient().get(captchaKey);
    if (isEmpty(captcha) || dto.verifyCode !== captcha) {
      throw new ApiFailedException(ErrorEnum.CODE_1021);
    }

    // ??????????????????
    const user = await this.entityManager.findOne(SysUserEntity, {
      select: ['account', 'password', 'id', 'status', 'deptId'],
      where: { account: dto.account },
    });

    if (isEmpty(user)) {
      throw new ApiFailedException(ErrorEnum.CODE_1022);
    }

    // ????????????
    const encryPwd = this.generalService.generateUserPassword(dto.password);
    if (user.password !== encryPwd) {
      throw new ApiFailedException(ErrorEnum.CODE_1022);
    }

    // ?????????????????????????????????
    if (!this.generalService.isRootUser(user.id)) {
      // ???????????????????????????
      if (user.status === StatusTypeEnum.Disable) {
        throw new ApiFailedException(ErrorEnum.CODE_1024);
      }

      // ??????????????????????????????
      const deptEnable = await this.sysDeptRepo.findDeptEnableByid(user.deptId);

      if (!deptEnable) {
        throw new ApiFailedException(ErrorEnum.CODE_1024);
      }
    }

    // ??????JWT Token
    const payload: IAuthUser = { uid: user.id };
    const token = this.jwtService.sign(payload);
    const onlineKey = `${UserOnlineCachePrefix}${user.id}`;

    // ??????Redis????????????
    await this.redisService
      .getClient()
      .set(onlineKey, token, 'EX', this.configService.jwtConfig.expires);

    // ??????????????????
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
      throw new ApiFailedException(ErrorEnum.CODE_1026);
    }

    const user = await this.entityManager.findOne(SysUserEntity, {
      where: { id: uid },
    });

    // ????????????????????????????????????????????????????????????
    if (this.generalService.isRootUser(uid)) {
      const pms = await this.entityManager.find(SysPermMenuEntity, {
        order: {
          orderNum: 'DESC',
        },
      });

      // ?????????????????????????????????
      const result = this.splitPermAndMenu(pms);
      await this.redisService
        .getClient()
        .set(`${UserPermCachePrefix}${user.id}`, JSON.stringify(result.perms));
      return result;
    }

    const allSubRoles = await this.sysRoleRepo.findAllEnableIds(user.roleIds);

    // ???????????????????????????
    const roles = await this.entityManager.find<SysRoleEntityTreeNode>(
      SysRoleEntity,
      {
        select: ['permMenuIds'],
        where: {
          id: In(allSubRoles),
        },
      },
    );

    // ??????????????????????????????????????????????????????
    let permmenuIds: number[] = [];

    for (let i = 0; i < roles.length; i++) {
      permmenuIds.push(...roles[i].permMenuIds);
    }

    // ??????????????????
    permmenuIds = uniq(permmenuIds);

    // ????????????????????????
    const pms = await this.entityManager.find(SysPermMenuEntity, {
      where: {
        id: In(permmenuIds),
      },
      order: {
        orderNum: 'DESC',
      },
    });

    // ????????????
    const result = this.splitPermAndMenu(pms);
    await this.redisService
      .getClient()
      .set(`${UserPermCachePrefix}${user.id}`, JSON.stringify(result.perms));
    return result;
  }

  /**
   * ????????????????????????
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

    return new UserPermMenuRespDto(
      menus,
      uniq(perms).map((e) => `/${e.replace(/^\/+/, '')}`),
    );
  }

  async userLogout(uid: number): Promise<void> {
    const keys = [UserOnlineCachePrefix, UserPermCachePrefix].map(
      (e) => `${e}${uid}`,
    );

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
    const config = await this.entityManager.findOne(SysDictionaryEntity, {
      select: ['status'],
      where: {
        uniqueKey: CONFIG_SYS_USERINFO,
      },
    });

    if (config.status === StatusTypeEnum.Disable) {
      throw new ApiFailedException(ErrorEnum.CODE_1027);
    }

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
    const config = await this.entityManager.findOne(SysDictionaryEntity, {
      select: ['status'],
      where: {
        uniqueKey: CONFIG_SYS_CH_PWD,
      },
    });

    if (config.status === StatusTypeEnum.Disable) {
      throw new ApiFailedException(ErrorEnum.CODE_1028);
    }

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
      throw new ApiFailedException(ErrorEnum.CODE_1023);
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
