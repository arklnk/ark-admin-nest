/**
 * 业务错误码定义
 */
export enum ErrorEnum {
  ServerErrorCode = 1000,
  ParamErrorCode = 1001,
  CaptchaErrorCode = 1002,
  AccountErrorCode = 1003,
  PasswordErrorCode = 1004,
  NotPermMenuErrorCode = 1005,
  DeletePermMenuErrorCode = 1006,
  ParentPermMenuErrorCode = 1007,
  AddRoleErrorCode = 1008,
  DeleteRoleErrorCode = 1009,
  AddDeptErrorCode = 1010,
  DeleteDeptErrorCode = 1011,
  AddJobErrorCode = 1012,
  DeleteJobErrorCode = 1013,
  AddProfessionErrorCode = 1014,
  DeleteProfessionErrorCode = 1015,
  AddUserErrorCode = 1016,
  DeptHasUserErrorCode = 1017,
  RoleIsUsingErrorCode = 1018,
  ParentRoleErrorCode = 1019,
  ParentDeptErrorCode = 1020,
  AccountDisableErrorCode = 1021,
  SetParentIdErrorCode = 1022,
  SetParentTypeErrorCode = 1023,
  AddConfigErrorCode = 1024,
  AddDictionaryErrorCode = 1025,
  AuthErrorCode = 1026,
  DeleteDictionaryErrorCode = 1027,
  JobIsUsingErrorCode = 1028,
  ProfessionIsUsingErrorCode = 1029,
  ForbiddenErrorCode = 1030,
  UpdateRoleUniqueKeyErrorCode = 1031,
  UpdateDeptUniqueKeyErrorCode = 1032,
  AssigningRolesErrorCode = 1033,
  DeptIdErrorCode = 1034,
  ProfessionIdErrorCode = 1035,
  JobIdErrorCode = 1036,
  ParentRoleIdErrorCode = 1037,
  ParentDeptIdErrorCode = 1038,
  ParentPermMenuIdErrorCode = 1039,
  ParentDictionaryIdErrorCode = 1040,
  DictionaryIdErrorCode = 1041,
  PermMenuIdErrorCode = 1042,
  RoleIdErrorCode = 1043,
  UserIdErrorCode = 1044,
}

export const errorMsgMap = initErrorMsg();

function initErrorMsg(): Map<ErrorEnum, string> {
  const errorMsg = new Map<ErrorEnum, string>();

  errorMsg[ErrorEnum.ServerErrorCode] = '服务繁忙，请稍后重试';
  errorMsg[ErrorEnum.CaptchaErrorCode] = '验证码错误';
  errorMsg[ErrorEnum.AccountErrorCode] = '账号错误';
  errorMsg[ErrorEnum.PasswordErrorCode] = '密码错误';
  errorMsg[ErrorEnum.NotPermMenuErrorCode] = '权限不足';
  errorMsg[ErrorEnum.DeletePermMenuErrorCode] = '该权限菜单存在子级权限菜单';
  errorMsg[ErrorEnum.ParentPermMenuErrorCode] = '父级菜单不能为自己';
  errorMsg[ErrorEnum.AddRoleErrorCode] = '角色已存在';
  errorMsg[ErrorEnum.DeleteRoleErrorCode] = '该角色存在子角色';
  errorMsg[ErrorEnum.AddDeptErrorCode] = '部门已存在';
  errorMsg[ErrorEnum.DeleteDeptErrorCode] = '该部门存在子部门';
  errorMsg[ErrorEnum.AddJobErrorCode] = '岗位已存在';
  errorMsg[ErrorEnum.DeleteJobErrorCode] = '该岗位正在使用中';
  errorMsg[ErrorEnum.AddProfessionErrorCode] = '职称已存在';
  errorMsg[ErrorEnum.DeleteProfessionErrorCode] = '该职称正在使用中';
  errorMsg[ErrorEnum.AddUserErrorCode] = '账号已存在';
  errorMsg[ErrorEnum.DeptHasUserErrorCode] = '该部门正在使用中';
  errorMsg[ErrorEnum.RoleIsUsingErrorCode] = '该角色正在使用中';
  errorMsg[ErrorEnum.ParentRoleErrorCode] = '父级角色不能为自己';
  errorMsg[ErrorEnum.ParentDeptErrorCode] = '父级部门不能为自己';
  errorMsg[ErrorEnum.AccountDisableErrorCode] = '账号已禁用';
  errorMsg[ErrorEnum.SetParentIdErrorCode] = '不能设置子级为自己的父级';
  errorMsg[ErrorEnum.SetParentTypeErrorCode] = '权限类型不能作为父级菜单';
  errorMsg[ErrorEnum.AddConfigErrorCode] = '配置已存在';
  errorMsg[ErrorEnum.AddDictionaryErrorCode] = '字典已存在';
  errorMsg[ErrorEnum.AuthErrorCode] = '授权已失效，请重新登录';
  errorMsg[ErrorEnum.DeleteDictionaryErrorCode] = '该字典集存在配置项';
  errorMsg[ErrorEnum.JobIsUsingErrorCode] = '该岗位正在使用中';
  errorMsg[ErrorEnum.ProfessionIsUsingErrorCode] = '该职称正在使用中';
  errorMsg[ErrorEnum.ForbiddenErrorCode] = '禁止操作';
  errorMsg[ErrorEnum.UpdateRoleUniqueKeyErrorCode] = '角色标识已存在';
  errorMsg[ErrorEnum.UpdateDeptUniqueKeyErrorCode] = '部门标识已存在';
  errorMsg[ErrorEnum.AssigningRolesErrorCode] = '角色不在可控范围';
  errorMsg[ErrorEnum.DeptIdErrorCode] = '部门不存在';
  errorMsg[ErrorEnum.ProfessionIdErrorCode] = '职称不存在';
  errorMsg[ErrorEnum.JobIdErrorCode] = '岗位不存在';
  errorMsg[ErrorEnum.ParentRoleIdErrorCode] = '父级角色不存在';
  errorMsg[ErrorEnum.ParentDeptIdErrorCode] = '父级部门不存在';
  errorMsg[ErrorEnum.ParentPermMenuIdErrorCode] = '父级菜单不存在';
  errorMsg[ErrorEnum.ParentDictionaryIdErrorCode] = '字典集不存在';
  errorMsg[ErrorEnum.DictionaryIdErrorCode] = '字典不存在';
  errorMsg[ErrorEnum.PermMenuIdErrorCode] = '权限菜单不存在';
  errorMsg[ErrorEnum.RoleIdErrorCode] = '角色不存在';
  errorMsg[ErrorEnum.UserIdErrorCode] = '用户不存在';

  return errorMsg;
}
