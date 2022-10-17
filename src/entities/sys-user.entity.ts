import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from '/@/common/abstract.entity';

@Entity({ name: 'sys_user' })
export class SysUser extends AbstractEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '账号' })
  account: string;

  @Column({ type: 'char', length: 32, comment: '密码' })
  password: string;

  @Column({ type: 'varchar', length: 50, comment: '姓名' })
  username: string;

  @Column({ type: 'varchar', length: 50, comment: '昵称' })
  nickname: string;

  @Column({ type: 'varchar', length: 400, comment: '头像' })
  avatar: string;

  @Column({
    type: 'tinyint',
    length: 1,
    unsigned: true,
    comment: '性别: 0=保密 1=女 2=男',
  })
  gender: number;

  @Column({ type: 'varchar', length: 50, comment: '邮件' })
  email: string;

  @Column({ type: 'char', length: 11, comment: '手机号' })
  mobile: string;

  @Column({
    name: 'profession_id',
    type: 'int',
    length: 11,
    unsigned: true,
    comment: '职称',
  })
  professionId: number;

  @Column({
    name: 'job_id',
    type: 'int',
    length: 11,
    unsigned: true,
    comment: '岗位',
  })
  jobId: number;

  @Column({
    name: 'dept_id',
    type: 'int',
    length: 11,
    unsigned: true,
    comment: '部门',
  })
  deptId: number;

  @Column({ name: 'role_ids', type: 'simple-json', comment: '角色集' })
  roleIds: number[];

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

  @Column({ type: 'varchar', length: 200 })
  remark: string;
}
