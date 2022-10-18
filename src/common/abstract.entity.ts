import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Abstract Entity
 */
export abstract class AbstractEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @CreateDateColumn({ name: 'create_time', type: 'timestamp' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'timestamp' })
  updateTime: Date;
}
