import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '/@//constants/errorx';

/**
 * 业务错误时可抛出该异常
 */
export class ApiFailedException extends HttpException {
  private errorCode: number;

  /**
   * 业务错误，请求结果仍为200
   */
  constructor(errCode: ErrorEnum) {
    super(`ApiFailedException: ${errCode}`, HttpStatus.OK);
    this.errorCode = errCode;
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}
