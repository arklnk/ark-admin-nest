import type { PaginationInfo, PaginationResData } from './response';

declare global {
  interface Fn<T = any, R = T> {
    (...arg: T[]): R;
  }

  type NonNull<T> = T extends null | undefined ? never : T;
  type Arrayable<T> = T | T[];
  type Nullable<T> = T | null;
  type Nilable<T> = T | null | undefined;
  type Recordable<T = any> = Record<string, T>;

  // Array polyfill
  interface Array<T> {
    /**
     * Generate pagination result
     */
    toPage(this: T[], page: PaginationInfo): PaginationResData<T>;
  }
}
