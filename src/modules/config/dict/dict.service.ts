import type { PaginationResData, ListResData } from '/@/interfaces/response';

import { ConfigDictAddReqDto, ConfigDictRespItemDto } from './dict.dto';
import { Injectable } from '@nestjs/common';
import { AbstractService } from '/@/common/abstract.service';
import { SysDictionaryEntity } from '/@/entities/sys-dictionary.entity';

@Injectable()
export class ConfigDictService extends AbstractService {
  async addConfigDict(body: ConfigDictAddReqDto): Promise<void> {
    await this.entityManager.insert(SysDictionaryEntity, body);
  }

  async getConfigDictDataByPage(
    page: number,
    limit: number,
    parentId: number,
  ): Promise<PaginationResData<ConfigDictRespItemDto>> {
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

  async getConfigDictList(): Promise<ListResData<SysDictionaryEntity>> {
    const rows = await this.entityManager.find(SysDictionaryEntity, {
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
        parentId: 0,
      },
    });

    return rows.toList();
  }

  async deleteConfigDict(id: number): Promise<void> {
    await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(SysDictionaryEntity)
      .where('id = :id', { id })
      .orWhere('parentId = :id', { id })
      .execute();
  }
}
