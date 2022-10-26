import type { SysRole } from '/@/entities/sys-role.entity';

export type SysRoleTreeNode = SysRole & { children?: SysRole[] };
