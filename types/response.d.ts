export interface BaseResponse<T = any> {
  msg: string;
  code: number;
  data?: T;
}

export interface ListResData<T = any> {
  list: T[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
}

export interface PaginationResData<T = any> extends ListResData<T> {
  pagination: PaginationInfo;
}
