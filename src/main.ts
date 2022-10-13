import type { NestExpressApplication } from '@nestjs/platform-express';

import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SharedModule } from './shared/shared.module';
import { AppConfigService } from './shared/services/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  const configService = app.select(SharedModule).get(AppConfigService);
  const { globalPrefix, port } = configService.appConfig;

  app.setGlobalPrefix(globalPrefix);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
