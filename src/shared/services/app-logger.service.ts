import type { Logger as WinstonLogger } from 'winston';

import { LoggerService, Injectable } from '@nestjs/common';
import { AppConfigService } from './app-config.service';
import { createLogger, transports, format, addColors } from 'winston';
import 'winston-daily-rotate-file';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

const LogLevelOrder: LogLevel[] = [
  LogLevel.ERROR,
  LogLevel.WARN,
  LogLevel.INFO,
  LogLevel.DEBUG,
  LogLevel.VERBOSE,
];

const LogLevelColor: string[] = ['red', 'yellow', 'green', 'cyan', 'gray'];

const commonMessageFormat = format((info) => {
  if (!info.pid) {
    info.pid = process.pid;
  }

  info.level = info.level.toUpperCase();

  return info;
});

const commonMessagePrint = format.printf((info) => {
  let output = `${info.timestamp} ${info.pid} ${info.level} ${info.context} `;
  if (info.stack) {
    output += `${info.stack}`;
  } else {
    output += info.message;
  }
  return output;
});

@Injectable()
export class AppLoggerService implements LoggerService {
  private winstonLogger: WinstonLogger;

  constructor(private readonly configService: AppConfigService) {
    const level = configService.loggerConfig.level;
    const levelIndex = LogLevelOrder.findIndex((e) => e === level);
    if (levelIndex === -1) {
      throw new Error(
        'Invalid logger level, configurable level ' + LogLevelOrder.join(','),
      );
    }

    this.initWinston();
  }

  protected get level(): LogLevel {
    return this.configService.loggerConfig.level as LogLevel;
  }

  protected initWinston(): void {
    this.winstonLogger = createLogger({
      levels: this.createNestLogLevels(),
      transports: [
        new transports.DailyRotateFile({
          filename: 'logs/app.%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: this.configService.loggerConfig.maxFiles,
          level: this.level,
          format: format.combine(commonMessagePrint),
          auditFile: 'logs/.audit/app.json',
        }),
        new transports.DailyRotateFile({
          filename: 'logs/app-error.%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: this.configService.loggerConfig.maxFiles,
          level: LogLevel.ERROR,
          format: format.combine(commonMessagePrint),
          auditFile: 'logs/.audit/app-error.json',
        }),
      ],
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss,SSS' }),
        commonMessageFormat(),
      ),
    });

    // 生产环境下会禁用控制台输出
    if (!this.configService.isProduction) {
      this.winstonLogger.add(
        new transports.Console({
          level: this.level,
          format: format.combine(
            commonMessagePrint,
            format.colorize({ all: true }),
          ),
        }),
      );
    }
  }

  protected createNestLogLevels() {
    const levels: { [key: string]: number } = {};
    const colors: { [key: string]: string } = {};
    LogLevelOrder.forEach((e, i) => {
      levels[e] = i;
      colors[e] = LogLevelColor[i];
    });
    addColors(colors);
    return levels;
  }

  verbose(message: any, context?: string): void {
    this.winstonLogger.log(LogLevel.VERBOSE, message, { context });
  }

  debug(message: any, context?: string): void {
    this.winstonLogger.log(LogLevel.DEBUG, message, { context });
  }

  log(message: any, context?: string): void {
    this.winstonLogger.log(LogLevel.INFO, message, { context });
  }

  warn(message: any, context?: string): void {
    this.winstonLogger.log(LogLevel.WARN, message, { context });
  }

  error(message: any, stack?: string, context?: string): void {
    const hasStack = !!context;
    this.winstonLogger.log(LogLevel.ERROR, {
      context: hasStack ? context : stack,
      message: hasStack ? new Error(message) : message,
    });
  }
}
