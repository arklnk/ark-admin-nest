import type { IPaginationInfo, IBaseResponse } from '/@/interfaces/response';

import { ApiProperty } from '@nestjs/swagger';
import {
  RESPONSE_SUCCESS_CODE,
  RESPONSE_SUCCESS_MSG,
} from '/@/constants/response';

export class PaginationInfo implements IPaginationInfo {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class BaseResponse<T> implements IBaseResponse<T> {
  @ApiProperty({
    default: RESPONSE_SUCCESS_MSG,
  })
  msg: string;

  @ApiProperty({
    default: RESPONSE_SUCCESS_CODE,
  })
  code: number;
}
