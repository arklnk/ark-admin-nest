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
import { isEmpty, omit } from 'lodash';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { ErrorEnum } from '/@/constants/errorx';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { AppConfigService } from '/@/shared/services/app-config.service';

@Injectable()
export class ConfigDictService extends AbstractService {
  constructor(private readonly configService: AppConfigService) {
    super();
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
          parentId: TREE_ROOT_NODE_ID,
        },
      },
    );

    return rows.toList();
  }

  async deleteConfigDict(id: number): Promise<void> {
    if (id <= this.configService.appConfig.protectSysDictionaryMaxId) {
      throw new ApiFailedException(ErrorEnum.CODE_1203);
    }

    const config = await this.entityManager.findOne(SysDictionaryEntity, {
      select: ['parentId'],
      where: {
        id,
      },
    });

    // 删除字典集时则需要判断是否存在字典配置项
    if (config.parentId === TREE_ROOT_NODE_ID) {
      const countChild = await this.entityManager.count(SysDictionaryEntity, {
        where: {
          parentId: id,
        },
      });

      if (countChild > 0) {
        throw new ApiFailedException(ErrorEnum.CODE_1204);
      }
    }

    await this.entityManager.delete(SysDictionaryEntity, { id });
  }

  async addConfigDict(item: ConfigDictAddReqDto): Promise<void> {
    if (item.parentId !== TREE_ROOT_NODE_ID) {
      // if dict data, check parent dict is exists
      const parent = await this.entityManager.findOne(SysDictionaryEntity, {
        select: ['id'],
        where: {
          parentId: 0,
          id: item.parentId,
        },
      });

      if (isEmpty(parent)) {
        throw new ApiFailedException(ErrorEnum.CODE_1201);
      }
    }

    const dict = await this.entityManager.findOne(SysDictionaryEntity, {
      select: ['id'],
      where: {
        uniqueKey: item.uniqueKey,
      },
    });

    if (!isEmpty(dict)) {
      throw new ApiFailedException(ErrorEnum.CODE_1202);
    }

    await this.entityManager.insert(SysDictionaryEntity, item);
  }

  async updateConfigDict(item: ConfigDictUpdateReqDto): Promise<void> {
    if (item.parentId !== TREE_ROOT_NODE_ID) {
      // if dict data, check parent dict is exists
      const parent = await this.entityManager.findOne(SysDictionaryEntity, {
        select: ['id'],
        where: {
          parentId: 0,
          id: item.parentId,
        },
      });

      if (isEmpty(parent)) {
        throw new ApiFailedException(ErrorEnum.CODE_1201);
      }
    }

    await this.entityManager.update(
      SysDictionaryEntity,
      { id: item.id },
      {
        ...omit(item, 'id'),
      },
    );
  }
}
