import { BaseResponse } from '../../types';
import { MidwayHttpError, MidwayEnvironmentService } from '@midwayjs/core';
import { Catch, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { BusinessError } from '../error/business.error';
import { errorMsgMap } from '../common/errorx';

@Catch()
export class InternalErrorFilter {
  @Inject()
  envService: MidwayEnvironmentService;

  async catch(err: Error, context: Context): Promise<BaseResponse<null>> {
    let code = 1000;
    let msg = errorMsgMap[code];
    let status = 500;

    if (err instanceof MidwayHttpError) {
      status = err.status;
      msg = err.message;
    }

    if (err instanceof BusinessError) {
      code = err.errorCode;
    }

    // system internal unknown error
    // remove detailed error information from the production environment
    if (
      (status < 200 || status >= 300) &&
      this.envService.isDevelopmentEnvironment()
    ) {
      msg = err.message;
    }

    // set response status
    context.response.status = status;

    return { code, msg, data: null };
  }
}
