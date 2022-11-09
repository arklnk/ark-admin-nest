import type {
  IBaseResponse,
  IPaginationRespData,
  IListRespData,
} from '/@/interfaces/response';
import type { ApiPropertyOptions } from '@nestjs/swagger';

import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse, PaginationInfo } from '../dtos/base-response.dto';

type WrapRespOptions = ApiPropertyOptions & {
  // data struct
  struct?: 'list' | 'page';
};

export const wrapResponse = <
  T,
  U extends Type<IBaseResponse<T | IPaginationRespData<T> | IListRespData<T>>>,
>(
  options?: WrapRespOptions,
): U => {
  // if opt or type not define
  if (!options || !options.type) {
    return BaseResponse as unknown as U;
  }

  /**
   * define swagger schema name
   */
  function defineSchemaName(o: any, type: WrapRespOptions['type']): void {
    const name = ((): string => {
      if (typeof type === 'string') {
        return type;
      } else if (type instanceof Array) {
        return type[0].name;
      } else {
        return type.name;
      }
    })();

    Object.defineProperty(o, 'name', {
      writable: true,
      value: `${o.name}<${name}>`,
    });
  }

  // process return data type
  let wrapDataType = options.type;

  // process specifydata struct
  switch (options.struct) {
    case 'list':
      class ResponseListDataWrap<T> implements IListRespData {
        @ApiProperty({ type: wrapDataType, isArray: true })
        list: T[];
      }

      defineSchemaName(ResponseListDataWrap, wrapDataType);
      wrapDataType = ResponseListDataWrap;
      break;

    case 'page':
      class ResponsePageDataWrap<T> implements IPaginationRespData {
        @ApiProperty()
        pagination: PaginationInfo;

        @ApiProperty({ type: wrapDataType, isArray: true })
        list: T[];
      }

      defineSchemaName(ResponsePageDataWrap, wrapDataType);
      wrapDataType = ResponsePageDataWrap;
      break;
  }

  // wrap response
  class BaseResponseWrap<
    Data = T | IPaginationRespData<T> | IListRespData<T>,
  > extends BaseResponse<Data> {
    @ApiProperty({ ...options, type: wrapDataType })
    data: Data;
  }

  // generate data type name
  defineSchemaName(BaseResponseWrap, wrapDataType);
  return BaseResponseWrap as unknown as U;
};
