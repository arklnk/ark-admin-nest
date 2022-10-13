import { HttpException, HttpStatus } from '@nestjs/common';
import { errorx } from '../constants/errorx';

/**
 * 业务错误时可抛出该异常
 */
export class ApiFailedException extends HttpException {
  private errorCode: number;

  constructor(errCode: number) {
    super(errorx[errCode], HttpStatus.OK);
    this.errorCode = errCode;
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}
