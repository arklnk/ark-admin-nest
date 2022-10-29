import type {
  IBaseResponse,
  IPaginationRespData,
  IListRespData,
  IPaginationInfo,
} from '/@/interfaces/response';
import type { ApiPropertyOptions } from '@nestjs/swagger';

import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

type WrapRespOptions = ApiPropertyOptions & {
  // data struct
  struct?: 'list' | 'page';
};

class PaginationInfo implements IPaginationInfo {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

function defineName(o: any, type: WrapRespOptions['type'], wrap: string): void {
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
    value: `${wrap}<${name}>`,
  });
}

export const wrapResponse = <
  T,
  U extends Type<IBaseResponse<T | IPaginationRespData<T> | IListRespData<T>>>,
>(
  options: WrapRespOptions,
): U => {
  // process return data type
  let dataType = options.type;

  if (options.struct === 'list') {
    // list resp
    class ListDataClass<T> implements IListRespData {
      @ApiProperty({ type: dataType, isArray: true })
      list: T[];
    }

    defineName(ListDataClass, dataType, 'ListRespData');
    dataType = ListDataClass;
  } else if (options.struct === 'page') {
    // page resp
    class PageDataClass<T> implements IPaginationRespData {
      @ApiProperty()
      pagination: PaginationInfo;

      @ApiProperty({ type: dataType, isArray: true })
      list: T[];
    }

    defineName(PageDataClass, dataType, 'PaginationRespData');
    dataType = PageDataClass;
  }

  // base response
  class BaseRespClass<Data = T | IPaginationRespData<T> | IListRespData<T>>
    implements IBaseResponse<Data>
  {
    @ApiProperty()
    msg: string;

    @ApiProperty()
    code: number;

    @ApiProperty({ ...options, type: dataType })
    data: Data;
  }

  // generate data type name
  defineName(BaseRespClass, dataType, 'BaseResponse');

  return BaseRespClass as unknown as U;
};
