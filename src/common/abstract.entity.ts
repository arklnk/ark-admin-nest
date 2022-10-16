import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Abstract Entity
 */
export abstract class AbstractEntity {
  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
