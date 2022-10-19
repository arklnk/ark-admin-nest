import type { PaginationInfo, PaginationResData } from './response';

declare global {
  interface Array<T> {
    /**
     * Generate pagination result
     */
    toPage(this: T[], page: PaginationInfo): PaginationResData<T>;
  }
}
