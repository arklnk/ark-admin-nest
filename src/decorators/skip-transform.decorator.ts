import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_DECORATOR_KEY = 'decorator:skip_transform';

/**
 * 当不需要转换成基础返回格式时添加该装饰器
 */
export const SkipTransform = () =>
  SetMetadata(SKIP_TRANSFORM_DECORATOR_KEY, true);
