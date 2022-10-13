import type { BaseResponse } from '/#/response';
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
import { errorx } from '/@/constants/errorx';
import { RESPONSE_ERROR_CODE } from '/@/constants/response';

@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: AppConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // response status code
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // api error code
    let apiErrorCode = RESPONSE_ERROR_CODE;
    let errorMessage =
      exception instanceof HttpException
        ? exception.message
        : errorx[apiErrorCode];

    if (exception instanceof ApiFailedException) {
      apiErrorCode = exception.getErrorCode();
    }

    // system internal unknown error
    // remove detailed error information from the production environment
    if (
      this.configService.isDevelopment &&
      httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      errorMessage = `${exception}`;
    }

    // set base response
    const resBody: BaseResponse = {
      msg: errorMessage,
      code: apiErrorCode,
      data: null,
    };

    response.status(httpStatus).json(resBody);
  }
}
