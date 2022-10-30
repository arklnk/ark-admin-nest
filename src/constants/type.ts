export enum StatusTypeEnum {
  /**
   * 失败、禁用
   */
  Failure = 0,
  Disable = 0,

  /**
   * 成功、启用
   */
  Successful = 1,
  Enable = 1,
}

export enum SysLogTypeEnum {
  /**
   * 登录日志
   */
  Login = 1,

  /**
   * 操作日志
   */
  Operate = 2,
}

export enum SysMenuTypeEnum {
  /**
   * 目录
   */
  Catalogue = 0,

  /**
   * 菜单
   */
  Menu = 1,

  /**
   * 权限
   */
  Permission = 2,
}

export enum BoolTypeEnum {
  False = 0,
  True = 1,
}
