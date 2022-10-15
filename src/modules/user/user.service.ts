import type { ILoginCaptcha } from './user.interface';

import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as SvgCaptcha from 'svg-captcha';
import { buildShortUUID } from '/@/common/utils/uuid';
import { UserLoginCaptchaCachePrefix } from '/@/constants/cache';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async createLoginCaptcha(width?: number, height?: number) {
    const svg = SvgCaptcha.create({
      color: true,
      size: 4,
      noise: 4,
      width: width ?? 100,
      height: height ?? 40,
      charPreset: '1234567890',
    });

    const captcha: ILoginCaptcha = {
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        'base64',
      )}`,
      id: buildShortUUID(), // this.utils.generateUUID()
    };

    await this.redisService
      .getClient()
      .set(
        `${UserLoginCaptchaCachePrefix}${captcha.id}`,
        svg.text,
        'EX',
        60 * 5,
      );

    return captcha;
  }
}
