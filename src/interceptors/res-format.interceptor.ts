import type { BaseResponse } from '/#/response';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  RESPONSE_SUCCESS_CODE,
  RESPONSE_SUCCESS_MSG,
} from '/@/constants/response';
import { Reflector } from '@nestjs/core';
import { IGNORE_RES_FORMAT_DECORATOR_KEY } from '/@/decorators/ignore-res-format.decorator';

@Injectable()
export class ResFormatInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<BaseResponse> {
    return next.handle().pipe(
      map((data) => {
        // 统一处理返回结果，可使用@IgnoreResFormat()装饰器忽略默认处理
        const isIgnore = this.reflector.get(
          IGNORE_RES_FORMAT_DECORATOR_KEY,
          context.getHandler(),
        );

        if (isIgnore) return data;

        return {
          data,
          code: RESPONSE_SUCCESS_CODE,
          msg: RESPONSE_SUCCESS_MSG,
        };
      }),
    );
  }
}
