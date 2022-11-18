import {
  ConsoleLogger,
  ConsoleLoggerOptions,
  Injectable,
  LogLevel,
} from '@nestjs/common';
import { AppConfigService } from './app-config.service';
import { Appender, configure, getLogger, levels } from 'log4js';

/**
 * 将Nestjs内置日志等级进行等级排序, 并将内置log等级调整为info
 */
const LogLevelOrder: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];

@Injectable()
export class AppLoggerService extends ConsoleLogger {
  constructor(
    context: string,
    options: ConsoleLoggerOptions,
    private readonly configService: AppConfigService,
  ) {
    // 设置日志等级
    const level = configService.loggerConfig.level;
    const levelIndex = LogLevelOrder.findIndex((e) => e === level);
    if (levelIndex === -1) {
      throw new Error(
        'Invalid logger level, configurable level ' + LogLevelOrder.join(','),
      );
    }

    super(context, {
      ...options,
      timestamp: true,
      logLevels: LogLevelOrder.slice(levelIndex),
    });

    // 初始化log4js
    this.initLog4js();
  }

  verbose(message: any, context?: string): void {
    super.verbose.apply(this, [message, context]);

    if (this.isLevelEnabled('verbose')) {
      getLogger('verbose').log('verbose', message);
    }
  }

  debug(message: any, context?: string): void {
    super.debug.apply(this, [message, context]);

    if (this.isLevelEnabled('debug')) {
      getLogger('debug').log('debug', message);
    }
  }

  log(message: any, context?: string): void {
    super.log.apply(this, [message, context]);

    if (this.isLevelEnabled('log')) {
      getLogger('info').log('info', message);
    }
  }

  warn(message: any, context?: string): void {
    super.warn.apply(this, [message, context]);

    if (this.isLevelEnabled('warn')) {
      getLogger('warn').log('warn', message);
    }
  }

  error(message: any, stack?: string, context?: string): void {
    super.error.apply(this, [message, stack, context]);

    if (this.isLevelEnabled('error')) {
      getLogger('error').log('error', message);
    }
  }

  private initLog4js() {
    // 增加日志等级
    levels.addLevels({
      VERBOSE: { value: 5000, colour: 'blue' },
      DEBUG: { value: 10000, colour: 'cyan' },
      INFO: { value: 20000, colour: 'green' },
      WARN: { value: 30000, colour: 'yellow' },
      ERROR: { value: 40000, colour: 'red' },
    });

    configure({
      appenders: {
        verbose: this.createAppenders('verbose'),
        debug: this.createAppenders('debug'),
        info: this.createAppenders('info'),
        warn: this.createAppenders('warn'),
        error: this.createAppenders('error'),
        console: {
          type: 'console',
        },
      },
      categories: {
        default: {
          appenders: ['console'],
          level: 'all',
        },
        verbose: {
          appenders: ['verbose'],
          level: 'all',
        },
        debug: {
          appenders: ['debug'],
          level: 'all',
        },
        info: {
          appenders: ['info'],
          level: 'all',
        },
        warn: {
          appenders: ['warn'],
          level: 'all',
          enableCallStack: true,
        },
        error: {
          appenders: ['error'],
          level: 'all',
          enableCallStack: true,
        },
      },
    });
  }

  private createAppenders(level: LogLevel | 'info'): Appender {
    const enableCallStack = level === 'warn' || level === 'error';

    return {
      type: 'dateFile',
      filename: `logs/${level}`,
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true,
      numBackups: this.configService.loggerConfig.maxFiles,
      layout: {
        type: 'pattern',
        pattern:
          '[%h] %z %d{yyyy-MM-dd hh:mm:ss.SSS} %p %n%m' +
          `${enableCallStack ? ' %n%s' : ''}` +
          ' %n%x{divider}',
        tokens: {
          divider: '-'.repeat(150),
        },
      },
    };
  }
}
