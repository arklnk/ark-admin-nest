import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '/@/common/abstract.entity';

@Entity({ name: 'sys_dictionary' })
export class SysDictionary extends AbstractEntity {
  @Column({
    name: 'parent_id',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '0=配置集 !0=父级id',
  })
  parentId: number;

  @Column({ type: 'varchar', length: 50, comment: '名称' })
  name: string;

  @Column({
    type: 'tinyint',
    width: 2,
    unsigned: true,
    default: 1,
    comment:
      '类型: 1文本 2数字 3数组 4单选 5多选 6下拉 7日期 8时间 9单图 10多图 11单文件 12多文件',
  })
  type: number;

  @Column({
    name: 'unique_key',
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '唯一标识',
  })
  uniqueKey: string;

  @Column({ type: 'varchar', length: 2048, default: '', comment: '配置值' })
  value: string;

  @Column({
    type: 'tinyint',
    width: 1,
    unsigned: true,
    default: 1,
    comment: '状态:  0=禁用 1=开启',
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
