import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '/@/common/abstract.entity';

@Entity({ name: 'sys_dept' })
export class SysDept extends AbstractEntity {
  @Column({ name: 'parent_id', type: 'int', unsigned: true, comment: '父级id' })
  parentId: number;

  @Column({ type: 'varchar', length: 50, comment: '部门简称' })
  name: string;

  @Column({ type: 'varchar', length: 50, comment: '部门全称' })
  fullName: string;

  @Column({
    name: 'unique_key',
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '唯一标识',
  })
  uniqueKey: string;

  @Column({
    type: 'tinyint',
    width: 1,
    unsigned: true,
    default: 1,
    comment: '类型: 1=公司 2=子公司 3=部门	',
  })
  type: number;

  @Column({
    type: 'tinyint',
    width: 1,
    unsigned: true,
    default: 1,
    comment: '状态:  0=禁用 1=开启	',
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

  @Column({ type: 'varchar', length: 200, default: '', comment: '备注' })
  remark: string;
}
