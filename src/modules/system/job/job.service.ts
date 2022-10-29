import { Injectable } from '@nestjs/common';
import { SysJobAddReqDto } from './job.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysJobEntity } from '/@/entities/sys-job.entity';

@Injectable()
export class SystemJobService extends AbstractService {
  async addJob(item: SysJobAddReqDto): Promise<void> {
    await this.entityManager.insert(SysJobEntity, item);
  }
}
