import type { AuthUser } from '.';

import 'express';

declare module 'express' {
  interface Request {
    authUser?: AuthUser;
  }
}
