import type { SysPermMenu } from '/@/entities/sys-perm-menu.entity';

export interface IUserLoginCaptcha {
  img: string;
  id: string;
}

export interface IUserLogin {
  token: string;
}

export interface IUserPermMenu {
  menus: SysPermMenu[];
  perms: string[];
}
