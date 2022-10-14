import type { Request } from 'express';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 快速获取已通过授权的用户信息，而非手动通过Request获取
 */
export const AuthUser = createParamDecorator(
  (key: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.authUser;

    return key ? user?.[key] : user;
  },
);
