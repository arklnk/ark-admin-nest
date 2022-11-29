import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorEnum } from '/@/constants/errorx';

/**
 * 业务错误时可抛出该异常
 */
export class ApiFailedException extends HttpException {
  private errorCode: number;

  /**
   * 业务错误，请求结果仍为200
   */
  constructor(err: ErrorEnum) {
    super(`${err}`, HttpStatus.OK);
    const [code, msg] = err.split(':');
    super(msg, HttpStatus.OK);
    this.errorCode = Number(code);
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}
