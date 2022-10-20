import type { Request } from 'express';
import type { ExecutionContext } from '@nestjs/common';

import { createParamDecorator } from '@nestjs/common';

/**
 * 快速获取IP
 */
export const IP = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();

  return (
    // 判断是否有反向代理 IP
    (
      (request.headers['x-forwarded-for'] as string) ||
      // 判断后端的 socket 的 IP
      request.socket.remoteAddress
    ).replace('::ffff:', '')
  );
});
