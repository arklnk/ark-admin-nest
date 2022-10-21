import type { Request } from 'express';
import type { ExecutionContext } from '@nestjs/common';
import type { IAuthUser } from '/@/interfaces/auth';

import { createParamDecorator } from '@nestjs/common';

/**
 * 快速获取已通过授权的用户信息，而非手动通过Request获取
 */
export const AuthUser = (key?: keyof IAuthUser) => {
  return createParamDecorator((_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.authUser;

    return key ? user?.[key] : user;
  })();
};
