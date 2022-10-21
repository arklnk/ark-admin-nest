import type { IAuthUser } from './auth';

import 'express';

declare module 'express' {
  interface Request {
    authUser?: IAuthUser;
  }
}
