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
      port: this.getNumber('PORT'),
      globalPrefix: this.getString('GLOBAL_PREFIX'),
      rootUserId: this.getNumber('ROOT_USER_ID'),
      userPwdSalt: this.getString('USER_PWD_SALT'),
      userDefaultPwd: this.getString('USER_DEFAULT_PWD'),
      protectSysPermMenuMaxId: this.getNumber('PROTECT_SYS_PERMMENU_MAX_ID'),
      protectSysDictionaryMaxId: this.getNumber(
        'PROTECT_SYS_DICTIONARY_MAX_ID',
      ),
    };
  }

  get redisConfig(): RedisClientOptions {
    return {
      keyPrefix: `${this.appConfig.globalPrefix}:`,
      host: this.getString('REDIS_HOST'),
      port: this.getNumber('REDIS_PORT'),
      password: this.getString('REDIS_PASSWORD'),
      db: this.getNumber('REDIS_DB'),
    };
  }

  get jwtConfig(): JwtModuleOptions & { expires?: number } {
    return {
      secret: this.getString('JWT_SECRET'),
      expires: this.getNumber('JWT_EXPIRES'),
    };
  }

  get typeormConfig(): TypeOrmModuleOptions {
    // LOG_ORM_ENABLE config if use array must be a json string
    let loggerOptions: LoggerOptions = this.getString('DB_LOGGING') as 'all';

    try {
      // if config value is all will parse error
      loggerOptions = JSON.parse(loggerOptions);
    } catch {
      // ignore
    }

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
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      database: this.getString('DB_DATABASE'),
      logging: loggerOptions,
      logger: new TypeORMLogger(loggerOptions),
      entities,
    };
  }

  get swaggerConfig() {
    return {
      enable: this.getBoolean('SWAGGER_ENABLE'),
      path: this.getString('SWAGGER_PATH'),
    };
  }

  getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' environment variable is not a boolean');
    }
  }

  /**
   * internal function
   */
  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set');
    }
    return value;
  }
}
