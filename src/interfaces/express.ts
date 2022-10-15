import type { AuthUser } from './auth';

import 'express';

declare module 'express' {
  interface Request {
    authUser?: AuthUser;
  }
}
