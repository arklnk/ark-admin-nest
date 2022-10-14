import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_DECORATOR_KEY = 'decorator:skip_auth';

/**
 * 当接口不需要jwt鉴权时添加该装饰器
 */
export const SkipAuth = () => SetMetadata(SKIP_AUTH_DECORATOR_KEY, true);
