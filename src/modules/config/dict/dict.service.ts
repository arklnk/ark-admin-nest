import { Injectable } from '@nestjs/common';
import { ConfigDictAddReqDto } from './dict.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysDictionaryEntity } from '/@/entities/sys-dictionary.entity';

@Injectable()
export class ConfigDictService extends AbstractService {
  async addConfigDict(body: ConfigDictAddReqDto): Promise<void> {
    await this.entityManager.insert(SysDictionaryEntity, body);
  }
}
