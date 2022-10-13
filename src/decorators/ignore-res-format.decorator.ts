import { SetMetadata } from '@nestjs/common';

export const IGNORE_RES_FORMAT_DECORATOR_KEY = 'decorator:ignore_res_format';

export const IgnoreResFormat = (): MethodDecorator =>
  SetMetadata(IGNORE_RES_FORMAT_DECORATOR_KEY, true);
