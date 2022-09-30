import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    port: 7001,
  },
  jwt: {
    secret: 'kRZ3kA7LuB4LqOWi',
    expiresIn: 86400,
  },
} as MidwayConfig;
