import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum, errorMsgMap } from '/@/constants/errorx';

/**
 * 业务错误时可抛出该异常
 */
export class ApiFailedException extends HttpException {
  private errorCode: number;

  constructor(errCode: ErrorEnum) {
    super(errorMsgMap[errCode], HttpStatus.OK);
    this.errorCode = errCode;
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}
