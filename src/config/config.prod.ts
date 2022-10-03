import { MidwayConfig } from '@midwayjs/core';

export default {
  rootUserId: parseInt(process.env.ROOT_UID || '1'),
  jwt: {
    secret: 'kRZ3kA7LuB4LqOWi',
    expiresIn: 86400,
  },
  redis: {
    client: {
      port: parseInt(process.env.REDIS_PORT || '6379'),
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PWD,
      db: parseInt(process.env.REDIS_DB || '0'),
    },
  },
} as MidwayConfig;
