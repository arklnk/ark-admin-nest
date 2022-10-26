import type { SysRoleEntity } from '/@/entities/sys-role.entity';

export type SysRoleEntityTreeNode = SysRoleEntity & {
  children?: SysRoleEntity[];
};
