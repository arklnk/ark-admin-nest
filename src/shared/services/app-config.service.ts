import type { RedisClientOptions } from '@liaoliaots/nestjs-redis';
import type { JwtModuleOptions } from '@nestjs/jwt';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { LoggerOptions } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { isNil } from 'lodash';
import { TypeORMLogger } from '/@/providers/typeorm-logger';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.get('NODE_ENV');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get appConfig() {
    return {
      port: this.get<number>('application.port'),
      globalPrefix: this.get('application.name'),
      rootUserId: this.get<number>('application.rootUserId'),
      userPwdSalt: this.get('application.userPwdSalt'),
      userDefaultPwd: this.get('application.userDefaultPwd'),
      protectSysPermMenuMaxId: this.get<number>(
        'application.protectSysPermmenuMaxId',
      ),
      protectSysDictionaryMaxId: this.get<number>(
        'application.protectSysDictionaryMaxId',
      ),
    };
  }

  get redisConfig(): RedisClientOptions {
    return {
      keyPrefix: `${this.appConfig.globalPrefix}:`,
      host: this.get('redis.host'),
      port: this.get<number>('redis.port'),
      password: this.get('redis.password'),
      db: this.get<number>('redis.db'),
    };
  }

  get jwtConfig(): JwtModuleOptions & { expires?: number } {
    return {
      secret: this.get('jwt.secret'),
      expires: this.get<number>('jwt.expires'),
    };
  }

  get typeormConfig(): TypeOrmModuleOptions {
    // LOG_ORM_ENABLE config if use array must be a json string
    const loggerOptions: LoggerOptions = this.get<boolean | string | string[]>(
      'db.logging',
    ) as 'all';

    // entities load
    let entities = [__dirname + '/../../entities/**/*.entity{.ts,.js}'];

    // webpack is not compatible with glob static paths (e.g., the entities property in TypeOrmModule).
    // support to hmr
    if (module.hot) {
      const entityContext = require.context(
        './../../entities',
        true,
        /\.entity\.ts$/,
      );

      // loading entity class
      entities = entityContext.keys().map((id) => {
        const entityModule = entityContext<Recordable>(id);
        const [entity] = Object.values(entityModule);

        return entity as string;
      });
    }

    return {
      type: 'mysql',
      host: this.get('db.host'),
      port: this.get<number>('db.port'),
      username: this.get('db.username'),
      password: this.get('db.password'),
      database: this.get('db.database'),
      logging: loggerOptions,
      logger: new TypeORMLogger(loggerOptions),
      entities,
    };
  }

  get swaggerConfig() {
    return {
      enable: this.get<boolean>('swagger.enable'),
      path: this.get('swagger.path'),
    };
  }

  get loggerConfig() {
    return {
      level: this.get('logger.level'),
      maxFiles: this.get<number>('logger.maxFiles'),
    };
  }

  /**
   * internal function
   */
  private get<T = string>(key: string): T {
    const value = this.configService.get<T>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set');
    }
    return value;
  }
}
