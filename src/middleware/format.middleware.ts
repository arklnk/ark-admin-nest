import { IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { BaseResponse } from '../../types';
import { Middleware } from '@midwayjs/decorator';

@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (
      ctx: Context,
      next: NextFunction
    ): Promise<BaseResponse<any>> => {
      // 获取控制器或者上一个中间件的结果
      const result = await next();

      if (ctx.ignoreFormat)
        return ctx.ignoreFormat
          ? result
          : {
              msg: 'success',
              data: result || null,
              code: 200,
            };
    };
  }

  static getName(): string {
    return 'format';
  }
}
