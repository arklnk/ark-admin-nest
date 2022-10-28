import { ConfigDictAddReqDto, ConfigDictRespItemDto } from './dict.dto';
import { Injectable } from '@nestjs/common';
import { AbstractService } from '/@/common/abstract.service';
import { SysDictionaryEntity } from '/@/entities/sys-dictionary.entity';

@Injectable()
export class ConfigDictService extends AbstractService {
  async addConfigDict(body: ConfigDictAddReqDto): Promise<void> {
    await this.entityManager.insert(SysDictionaryEntity, body);
  }

  async getConfigDictDataByPage(page: number, limit: number, parentId: number) {
    const [rows, count] =
      await this.entityManager.findAndCount<ConfigDictRespItemDto>(
        SysDictionaryEntity,
        {
          select: [
            'id',
            'parentId',
            'name',
            'orderNum',
            'remark',
            'status',
            'type',
            'uniqueKey',
            'value',
          ],
          where: {
            parentId,
          },
          skip: (page - 1) * limit,
          take: limit,
        },
      );

    return rows.toPage({
      limit,
      page,
      total: count,
    });
  }
}
