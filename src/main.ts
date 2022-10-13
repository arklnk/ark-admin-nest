import type { NestExpressApplication } from '@nestjs/platform-express';

import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SharedModule } from './shared/shared.module';
import { AppConfigService } from './shared/services/app-config.service';
import { BaseExceptionFilter } from './filters/base.filter';
import { ResFormatInterceptor } from './interceptors/res-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  // global config
  const configService = app.select(SharedModule).get(AppConfigService);

  // reflector
  const reflector = app.get(Reflector);

  // global filters
  app.useGlobalFilters(new BaseExceptionFilter(configService));

  // global interceptors
  app.useGlobalInterceptors(new ResFormatInterceptor(reflector));

  const { globalPrefix, port } = configService.appConfig;
  app.setGlobalPrefix(globalPrefix);

  await app.listen(port, '0.0.0.0');
}

bootstrap();
