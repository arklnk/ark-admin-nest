import { MidwayHttpError } from '@midwayjs/core';
import { errorMsgMap } from '../common/errorx';

/**
 * 业务异常抛出该错误可处理提示，用于配合errorx输出错误提示
 */
export class BusinessError extends MidwayHttpError {
  private errCode: number;

  constructor(code: number) {
    super(errorMsgMap[code], 200);
    this.errCode = code;
  }

  get errorCode() {
    return this.errCode;
  }
}
