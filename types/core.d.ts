import type { AdminUser } from '.';

import '@midwayjs/core';

declare module '@midwayjs/core' {
  interface Context {
    /**
     * 当前请求的身份验证信息
     */
    adminUser?: AdminUser;

    /**
     * 返回原生数据，不使用BaseResponse包裹
     */
    ignoreFormat?: boolean;
  }

  interface MidwayConfig {
    /**
     * 指定用户ID为超级管理员
     */
    rootUserId?: number;
  }
}
