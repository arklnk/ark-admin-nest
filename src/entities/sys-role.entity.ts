import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '/@/common/abstract.entity';

@Entity({ name: 'sys_role' })
export class SysRoleEntity extends AbstractEntity {
  @Column({
    name: 'parent_id',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '父级id',
  })
  parentId: number;

  @Column({ type: 'varchar', length: 50, comment: '名称' })
  name: string;

  @Column({
    name: 'unique_key',
    type: 'varchar',
    length: 50,
    comment: '唯一标识',
    unique: true,
  })
  uniqueKey: string;

  @Column({ type: 'varchar', length: 200, default: '', comment: '备注' })
  remark: string;

  @Column({ name: 'perm_menu_ids', type: 'simple-json', comment: '权限集' })
  permmenuIds: number[];

  @Column({
    type: 'tinyint',
    width: 1,
    unsigned: true,
    default: 1,
    comment: '状态: 0=禁用 1=开启',
  })
  status: number;

  @Column({
    name: 'order_num',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '排序值',
  })
  orderNum: number;
}
