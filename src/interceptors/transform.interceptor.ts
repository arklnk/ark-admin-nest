import type { IBaseResponse } from '/@/interfaces/response';

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
import { SKIP_TRANSFORM_DECORATOR_KEY } from '/@/decorators/skip-transform.decorator';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<IBaseResponse> {
    return next.handle().pipe(
      map((data) => {
        // check need transform
        const isSkipTransform = this.reflector.getAllAndOverride<boolean>(
          SKIP_TRANSFORM_DECORATOR_KEY,
          [context.getHandler(), context.getClass()],
        );

        if (isSkipTransform) return data;

        return {
          data,
          code: RESPONSE_SUCCESS_CODE,
          msg: RESPONSE_SUCCESS_MSG,
        };
      }),
    );
  }
}
