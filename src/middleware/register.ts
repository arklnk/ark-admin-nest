import { Application } from '@midwayjs/koa';
import { AuthMiddleware } from './auth.middleware';
import { FormatMiddleware } from './format.middleware';

export function registerMiddleware(app: Application) {
  app.useMiddleware([AuthMiddleware, FormatMiddleware]);
}
