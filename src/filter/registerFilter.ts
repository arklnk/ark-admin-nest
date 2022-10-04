import { Application } from '@midwayjs/koa';
import { InternalErrorFilter } from './internal.filter';

export function registerFilter(app: Application) {
  app.useFilter([InternalErrorFilter]);
}
