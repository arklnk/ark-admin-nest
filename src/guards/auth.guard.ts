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
import { UserPermMenuCachePrefix } from '/@/constants/cache';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';

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
      [context.getHandler, context.getClass],
    );
    if (isSkipAuth) return true;

    const request = context.switchToHttp().getRequest<Request>();

    // check the token is valid
    const token = request.headers['authorization'];
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

    // use the @AllowAnonPermission() decorator to allow operate
    const isAllowAnonPermission = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ANON_PERMISSION_DECORATOR_KEY,
      [context.getHandler, context.getClass],
    );

    if (isAllowAnonPermission) return true;

    // check current user have the operation permission
    const permmenu = await this.redisService
      .getClient()
      .get(`${UserPermMenuCachePrefix}${request.authUser.uid}`);

    if (isEmpty(permmenu)) {
      throw new ApiFailedException(1005);
    }

    const url = request.url;
    const path = url.split('?')[0];
    const permmenuArr: string[] = JSON.parse(permmenu);
    const prefixUrl = `/${this.configService.appConfig.globalPrefix}/`;

    if (!permmenuArr.includes(path.replace(prefixUrl, ''))) {
      throw new ApiFailedException(1005);
    }

    // can active
    return true;
  }
}
