import type { NestExpressApplication } from '@nestjs/platform-express';

import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { AppModule } from './app.module';
import { SharedModule } from './shared/shared.module';
import { AppConfigService } from './shared/services/app-config.service';
import { BaseExceptionFilter } from './filters/base.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { Authguard } from './guards/auth.guard';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  // app config service
  const configService = app.select(SharedModule).get(AppConfigService);

  // reflector
  const reflector = app.get(Reflector);

  // global filters
  app.useGlobalFilters(new BaseExceptionFilter(configService));

  // global interceptors
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TransformInterceptor(reflector),
  );

  // global guards
  const jwtService = app.select(SharedModule).get(JwtService);
  const redisService = app.get(RedisService);

  app.useGlobalGuards(
    new Authguard(reflector, jwtService, configService, redisService),
  );

  // global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors) =>
        new UnprocessableEntityException(
          errors.map((e) => {
            const rule = Object.keys(e.constraints)[0];
            const msg = e.constraints[rule];
            return `property ${e.property} validation failed: ${msg}, following constraints: ${rule}`;
          })[0],
        ),
    }),
  );

  // global prefix
  const { globalPrefix, port } = configService.appConfig;
  app.setGlobalPrefix(globalPrefix);

  await app.listen(port, '0.0.0.0');
}

bootstrap();
