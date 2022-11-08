import type { Request } from 'express';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH_DECORATOR_KEY } from '/@/decorators/skip-auth.decorator';
import { ALLOW_ANON_PERMISSION_DECORATOR_KEY } from '/@/decorators/allow-anon-permission.decorator';
import { JwtService } from '@nestjs/jwt';
import { isEmpty } from 'lodash';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { UserOnlineCachePrefix, UserPermCachePrefix } from '/@/constants/cache';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { ErrorEnum } from '/@/constants/errorx';

@Injectable()
export class Authguard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: AppConfigService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // to determine whether the interface needs authentication
    // use the @SkipAuth() decorator to skip authentication
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUTH_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isSkipAuth) return true;

    const request = context.switchToHttp().getRequest<Request>();

    // check the token is valid
    const token = request.headers['authorization']?.trim();
    if (isEmpty(token)) {
      throw new UnauthorizedException();
    }

    try {
      request.authUser = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException();
    }

    // check the jwt payload is valid
    if (isEmpty(request.authUser)) {
      throw new Error('jwt payload is invalid');
    }

    // check is expired
    const cacheToken = await this.redisService
      .getClient()
      .get(`${UserOnlineCachePrefix}${request.authUser.uid}`);

    if (isEmpty(cacheToken) || cacheToken !== token) {
      throw new UnauthorizedException();
    }

    // use the @AllowAnonPermission() decorator to allow operate
    const isAllowAnonPermission = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ANON_PERMISSION_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isAllowAnonPermission) return true;

    // check current user have the operation permission
    const permmenu = await this.redisService
      .getClient()
      .get(`${UserPermCachePrefix}${request.authUser.uid}`);

    if (isEmpty(permmenu)) {
      throw new ApiFailedException(ErrorEnum.NotPermMenuErrorCode);
    }

    const path = request.path;
    const permmenuArr: string[] = JSON.parse(permmenu);
    const prefixUrl = `/${this.configService.appConfig.globalPrefix}`;
    const reg = new RegExp(`^${prefixUrl}`);

    if (!permmenuArr.includes(path.replace(reg, ''))) {
      throw new ApiFailedException(ErrorEnum.NotPermMenuErrorCode);
    }

    // can active
    return true;
  }
}
