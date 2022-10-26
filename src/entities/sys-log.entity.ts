import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '/@/common/abstract.entity';

@Entity({ name: 'sys_log' })
export class SysLogEntity extends AbstractEntity {
  @Column({ name: 'user_id', type: 'int', unsigned: true, comment: '操作账号' })
  userId: number;

  @Column({ type: 'varchar', length: 100, comment: 'ip' })
  ip: string;

  @Column({ type: 'varchar', length: 200, comment: '请求路径' })
  uri: string;

  @Column({
    type: 'tinyint',
    width: 1,
    unsigned: true,
    comment: '类型: 1=登录日志 2=操作日志',
  })
  type: number;

  @Column({ type: 'varchar', length: 2048, default: '', comment: '请求数据' })
  request: string;

  @Column({
    type: 'tinyint',
    width: 1,
    unsigned: true,
    default: 1,
    comment: '状态: 0=失败 1=成功',
  })
  status: number;
}
