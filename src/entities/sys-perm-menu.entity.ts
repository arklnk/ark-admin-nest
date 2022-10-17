import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from '/@/common/abstract.entity';

@Entity({ name: 'sys_perm_menu' })
export class SysPermMenu extends AbstractEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

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

  @Column({ type: 'varchar', length: 1024, default: '', comment: '路由' })
  router: string;

  @Column({ type: 'varchar', length: 1024, default: '', comment: '权限' })
  perms: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 0,
    comment: '类型: 0=目录 1=菜单 2=权限',
  })
  type: number;

  @Column({ type: 'varchar', length: 200, default: '', comment: '图标' })
  icon: string;

  @Column({
    name: 'order_num',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '排序值',
  })
  orderNum: number;

  @Column({
    name: 'view_path',
    type: 'varchar',
    length: 1024,
    default: '',
    comment: '页面路径',
  })
  viewPath: string;

  @Column({
    name: 'is_show',
    type: 'tinyint',
    width: 1,
    unsigned: true,
    default: 1,
    comment: '是否显示: 0=隐藏 1=显示',
  })
  isShow: number;

  @Column({
    name: 'active_router',
    type: 'varchar',
    length: 1024,
    default: '',
    comment: '当前激活的菜单',
  })
  activeRouter: string;
}
