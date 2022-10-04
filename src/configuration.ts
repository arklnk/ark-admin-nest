import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as jwt from '@midwayjs/jwt';
import * as redis from '@midwayjs/redis';
import { join } from 'path';
import { ReportMiddleware } from './middleware/report.middleware';
import { InternalErrorFilter } from './filter/internal.filter';

@Configuration({
  imports: [koa, validate, jwt, redis],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {
    // middleware
    this.app.useMiddleware([ReportMiddleware]);

    // filter
    this.app.useFilter([InternalErrorFilter]);
  }
}
