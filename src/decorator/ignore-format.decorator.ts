import { MidwayDecoratorService, REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';
import { createCustomMethodDecorator } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

const IGNOREFORMAT_DECORATOR_KEY = 'decorator:ignore_format';

/**
 * 忽略BaseResponse包裹的基础返回格式，用于个别接口需要自定义返回特定的格式
 */
export function IgnoreFormat(): MethodDecorator {
  return createCustomMethodDecorator(IGNOREFORMAT_DECORATOR_KEY, {
    ignoreFormat: true,
  });
}

export function registerIgnoreFormatDecorator(service: MidwayDecoratorService) {
  service.registerMethodHandler(IGNOREFORMAT_DECORATOR_KEY, () => {
    return {
      afterReturn: async joinPoiont => {
        const ist = joinPoiont.target;
        const ctx: Context = ist[REQUEST_OBJ_CTX_KEY];
        ctx.ignoreFormat = true;
      },
    };
  });
}
