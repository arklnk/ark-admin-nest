import { SetMetadata } from '@nestjs/common';

export const ALLOW_ANON_PERMISSION_DECORATOR_KEY =
  'decorator:allow_anon_permission';

/**
 * 当接口不需要检测用户是否具有操作权限时添加该装饰器
 */
export const AllowAnonPermission = () =>
  SetMetadata(ALLOW_ANON_PERMISSION_DECORATOR_KEY, true);
