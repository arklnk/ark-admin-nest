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
    // CODE_500 str parse to 500 number
    this.errorCode = Number(
      Object.entries(ErrorEnum)
        .find(([_, val]) => val === err)[0]
        .replace('CODE_', ''),
    );
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}
