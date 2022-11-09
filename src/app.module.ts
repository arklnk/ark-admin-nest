import './polyfill';

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { SharedModule } from './shared/shared.module';
import { AppConfigService } from './shared/services/app-config.service';
import { UserModule } from './modules/user/user.module';
import { SystemModule } from './modules/system/system.module';
import { LogModule } from './modules/log/log.module';
import { ConfigModule } from './modules/config/config.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`,
        '.env.local',
        '.env',
      ],
    }),
    RedisModule.forRootAsync(
      {
        useFactory: (configService: AppConfigService) => {
          return {
            readyLog: true,
            config: configService.redisConfig,
          };
        },
        inject: [AppConfigService],
      },
      true,
    ),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: AppConfigService) => {
        return configService.typeormConfig;
      },
      inject: [AppConfigService],
    }),
    SharedModule,
    // business module
    UserModule,
    SystemModule,
    LogModule,
    ConfigModule,
  ],
})
export class AppModule {}
