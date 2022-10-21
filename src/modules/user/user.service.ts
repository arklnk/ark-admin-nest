import type {
  IUserLogin,
  IUserLoginCaptcha,
  IUserPermMenu,
} from './user.interface';
import type { IAuthUser } from '/@/interfaces/auth';

import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as SvgCaptcha from 'svg-captcha';
import { buildShortUUID } from '/@/common/utils/uuid';
import {
  UserLoginCaptchaCachePrefix,
  UserOnlineCachePrefix,
} from '/@/constants/cache';
import { AbstractService } from '/@/common/abstract.service';
import { UserLoginDto } from './user.dto';
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
  ): Promise<IUserLoginCaptcha> {
    const svg = SvgCaptcha.create({
      color: true,
      size: 4,
      noise: 4,
      width: width ?? 100,
      height: height ?? 40,
      charPreset: '1234567890',
    });

    const captcha: IUserLoginCaptcha = {
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        'base64',
      )}`,
      id: buildShortUUID(),
    };

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
    dto: UserLoginDto,
    ip: string,
    uri: string,
  ): Promise<IUserLogin> {
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
    if (user.status === StatusTypeEnum.FailureOrDisable) {
      throw new ApiFailedException(ErrorEnum.AccountDisableErrorCode);
    }

    // auth payload
    const payload: IAuthUser = { uid: user.id };
    const token = this.jwtService.sign(payload);
    const onlineKey = `${UserOnlineCachePrefix}${user.id}`;

    // set expires token, default 1 day
    await this.redisService
      .getClient()
      .set(
        onlineKey,
        token,
        'EX',
        this.configService.jwtConfig.expires || 60 * 60 * 24,
      );

    // save login log
    await this.entityManager.insert(SysLog, {
      userId: user.id,
      status: StatusTypeEnum.SuccessfulOrEnable,
      type: SysLogTypeEnum.Login,
      ip,
      uri,
      request: JSON.stringify(omit(dto, 'password')),
    });

    return {
      token,
    };
  }

  async getUserPermMenu(uid: number): Promise<IUserPermMenu> {
    const token = await this.redisService
      .getClient()
      .get(`${UserOnlineCachePrefix}${uid}`);

    if (isEmpty(token)) {
      throw new ApiFailedException(ErrorEnum.AuthErrorCode);
    }

    const user = await this.entityManager.findOne(SysUser, {
      where: { id: uid },
    });

    // is super admin
    if (user.roleIds.includes(this.configService.appConfig.rootRoleId)) {
      const pms = await this.entityManager.find(SysPermMenu);
      return this.splitPermAndMenu(pms);
    }

    return {
      menus: [],
      perms: [],
    };
  }

  private splitPermAndMenu(permmenu: SysPermMenu[]): IUserPermMenu {
    const menus: IUserPermMenu['menus'] = [];
    const perms: string[] = [];

    permmenu.forEach((e) => {
      if (e.type === SysMenuTypeEnum.Permission) {
        perms.push(...(JSON.parse(e.perms) as string[]));
      } else {
        menus.push(e);
      }
    });

    return {
      menus,
      perms: uniq(perms),
    };
  }
}
