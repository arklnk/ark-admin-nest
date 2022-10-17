import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from '/@/common/abstract.entity';

@Entity({ name: 'sys_profession' })
export class SysProfession extends AbstractEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '职称' })
  name: string;

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
