import { MidwayDecoratorService } from '@midwayjs/core';
import { createCustomParamDecorator } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { AdminUser } from '../../types';

const ADMINUSER_DECORATOR_KEY = 'decorator:admin_user';

/**
 * 快速获取请求上下文中的用户信息
 */
export function AdminUser(key?: keyof AdminUser): ParameterDecorator {
  return createCustomParamDecorator(ADMINUSER_DECORATOR_KEY, { key });
}

export function registerAdminUserDecorator(service: MidwayDecoratorService) {
  service.registerParameterHandler(ADMINUSER_DECORATOR_KEY, options => {
    const ctx: Context = options.originArgs[0];
    const key: string | undefined = options.metadata.key;

    return key ? ctx.adminUser?.[key] : ctx.adminUser;
  });
}
