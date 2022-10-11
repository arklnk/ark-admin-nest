import { IMiddleware } from '@midwayjs/core';
import { Config, Inject, Middleware } from '@midwayjs/decorator';
import { JwtService } from '@midwayjs/jwt';
import { Context, NextFunction } from '@midwayjs/koa';
import { RedisService } from '@midwayjs/redis';
import { isEmpty } from 'lodash';
import { AdminUser } from '../../types';
import { SysPermMenuCachePrefix } from '../common/const';
import { BusinessError } from '../error/business.error';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  jwtService: JwtService;

  @Inject()
  redisService: RedisService;

  @Config('koa.globalPrefix')
  globalPrefix: string;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      console.log(ctx);
      if (ctx.ignoreAuth) return await next();

      const url = ctx.request.url;
      const path = url.split('?')[0];
      const token = ctx.get('Authorization').trim();

      if (isEmpty(token)) {
        throw new BusinessError(1026);
      }

      try {
        ctx.adminUser = this.jwtService.verifySync(token, {
          complete: true,
        }) as unknown as AdminUser;
      } catch (e) {
        throw new BusinessError(1026);
      }

      if (isEmpty(token)) {
        throw new BusinessError(1026);
      }

      // 接口不需要校验权限时可使用@WithoutPermission()
      if (ctx.withoutPermission) return await next();

      const perms = await this.redisService.get(
        `${SysPermMenuCachePrefix}${ctx.adminUser!.uid}`
      );

      if (isEmpty(perms)) {
        throw new BusinessError(1005);
      }

      const permArray: string[] = JSON.parse(perms);

      if (!permArray.includes(path.replace(`${this.globalPrefix}/`, ''))) {
        throw new BusinessError(1005);
      }

      return await next();
    };
  }

  static getName(): string {
    return 'auth';
  }
}
