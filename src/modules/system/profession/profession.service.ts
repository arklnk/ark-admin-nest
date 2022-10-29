import { Injectable } from '@nestjs/common';
import { SysProfessionAddReqDto } from './profession.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysProfessionEntity } from '/@/entities/sys-profession.entity';

@Injectable()
export class SystemProfessionService extends AbstractService {
  async addProfession(item: SysProfessionAddReqDto): Promise<void> {
    await this.entityManager.insert(SysProfessionEntity, item);
  }
}
