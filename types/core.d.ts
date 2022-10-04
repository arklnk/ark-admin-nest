import type { AdminUser } from '.';

import '@midwayjs/core';

declare module '@midwayjs/core' {
  interface Context {
    /**
     * 当前请求的身份验证信息
     */
    adminUser?: AdminUser;
  }

  interface MidwayConfig {
    /**
     * 指定用户ID为超级管理员
     */
    rootUserId?: number;
  }
}
