import type { IBaseResponse } from '/@/interfaces/response';
import type { Response } from 'express';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { AppConfigService } from '/@/shared/services/app-config.service';
import { ErrorEnum } from '/@/constants/errorx';
import { errorMsgMap } from '/@/constants/errorm';

@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: AppConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 响应结果码判断
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const apiErrorCode =
      exception instanceof ApiFailedException
        ? exception.getErrorCode()
        : ErrorEnum.ServerErrorCode;

    let errorMessage =
      exception instanceof ApiFailedException
        ? errorMsgMap[apiErrorCode]
        : `${exception}`;

    // 系统内部错误时，在生产模式下隐藏具体异常消息
    if (
      this.configService.isProduction &&
      httpStatus === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      errorMessage = errorMessage[ErrorEnum.ServerErrorCode];
    }

    // 返回基础响应结果
    const resBody: IBaseResponse = {
      msg: errorMessage,
      code: apiErrorCode,
      data: null,
    };

    response.status(httpStatus).json(resBody);
  }
}
