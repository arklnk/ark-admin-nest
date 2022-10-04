import { Application } from '@midwayjs/koa';
import { FormatMiddleware } from './format.middleware';

export function registerMiddleware(app: Application) {
  app.useMiddleware([FormatMiddleware]);
}
