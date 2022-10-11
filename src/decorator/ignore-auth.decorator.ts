import { MidwayDecoratorService, REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';
import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

const IGNOREAUTH_DECORATOR_KEY = 'decorator:ignore_auth';

export function IgnoreAuth(): MethodDecorator {
  return createCustomMethodDecorator(IGNOREAUTH_DECORATOR_KEY, {});
}

export function registerIgnoreAuthDecorator(service: MidwayDecoratorService) {
  service.registerMethodHandler(IGNOREAUTH_DECORATOR_KEY, () => {
    return {
      before: async point => {
        const ist = point.target;
        const ctx: Context = ist[REQUEST_OBJ_CTX_KEY];
        ctx.ignoreAuth = true;
      },
    };
  });
}
