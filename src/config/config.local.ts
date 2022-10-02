import { MidwayConfig } from '@midwayjs/core';

export default {
  // https://www.midwayjs.org/docs/extensions/jwt
  jwt: {
    secret: 'kRZ3kA7LuB4LqOWi',
    expiresIn: 86400,
  },

  // https://www.midwayjs.org/docs/extensions/redis
  redis: {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '123456',
      db: 0,
    },
  },
} as MidwayConfig;
