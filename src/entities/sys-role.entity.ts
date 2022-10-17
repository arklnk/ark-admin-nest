import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from '/@/common/abstract.entity';

@Entity({ name: 'sys_role' })
export class SysRole extends AbstractEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({
    name: 'parent_id',
    type: 'int',
    length: 11,
    unsigned: true,
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
  })
  uniqueKey: string;

  @Column({ type: 'varchar', length: 200, comment: '备注' })
  remark: string;

  @Column({ name: 'perm_menu_ids', type: 'simple-json', comment: '权限集' })
  permmenuIds: number[];

  @Column({
    type: 'tinyint',
    length: 1,
    unsigned: true,
    comment: '状态: 0=禁用 1=开启',
  })
  status: number;

  @Column({
    name: 'order_num',
    type: 'int',
    length: 11,
    unsigned: true,
    comment: '排序值',
  })
  orderNum: number;
}
