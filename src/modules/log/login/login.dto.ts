import { SysLogEntity } from '/@/entities/sys-log.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';

export class LogLoginRespItemDto {
  account: string;
  id: number;
  ip: string;
  status: number;
  uri: string;
  createTime: Date;

  constructor(entity: SysLogEntity & Pick<SysUserEntity, 'account'>) {
    this.account = entity.account;
    this.id = entity.id;
    this.ip = entity.ip;
    this.status = entity.status;
    this.uri = entity.uri;
    this.createTime = entity.createTime;
    this.account = entity.account;
  }
}
