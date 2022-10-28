import type {
  IPaginationRespData,
  IListRespData,
} from '/@/interfaces/response';

import {
  ConfigDictAddReqDto,
  ConfigDictRespItemDto,
  ConfigDictUpdateReqDto,
} from './dict.dto';
import { Injectable } from '@nestjs/common';
import { AbstractService } from '/@/common/abstract.service';
import { SysDictionaryEntity } from '/@/entities/sys-dictionary.entity';
import { omit } from 'lodash';

@Injectable()
export class ConfigDictService extends AbstractService {
  async addConfigDict(body: ConfigDictAddReqDto): Promise<void> {
    await this.entityManager.insert(SysDictionaryEntity, body);
  }

  async getConfigDictDataByPage(
    page: number,
    limit: number,
    parentId: number,
  ): Promise<IPaginationRespData<ConfigDictRespItemDto>> {
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

  async getConfigDictList(): Promise<IListRespData<ConfigDictRespItemDto>> {
    const rows = await this.entityManager.find<ConfigDictRespItemDto>(
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
          parentId: 0,
        },
      },
    );

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

  async updateConfigDict(body: ConfigDictUpdateReqDto): Promise<void> {
    await this.entityManager.update(
      SysDictionaryEntity,
      { id: body.id },
      {
        ...omit(body, 'id'),
      },
    );
  }
}
