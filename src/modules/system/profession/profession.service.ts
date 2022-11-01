import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import {
  SysProfessionAddReqDto,
  SysProfessionDeleteReqDto,
  SysProfessionItemRespDto,
} from './profession.dto';
import { AbstractService } from '/@/common/abstract.service';
import { ErrorEnum } from '/@/constants/errorx';
import { SysProfessionEntity } from '/@/entities/sys-profession.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';

@Injectable()
export class SystemProfessionService extends AbstractService {
  async addProfession(item: SysProfessionAddReqDto): Promise<void> {
    await this.entityManager.insert(SysProfessionEntity, item);
  }

  async deleteProfession(id: number): Promise<void> {
    const count = await this.entityManager.count(SysUserEntity, {
      where: {
        professionId: id,
      },
    });

    if (count > 0) {
      throw new ApiFailedException(ErrorEnum.DeleteProfessionErrorCode);
    }

    await this.entityManager.delete(SysProfessionEntity, { id });
  }

  async getProfessionByPage(page: number, limit: number) {
    const [rows, count] =
      await this.entityManager.findAndCount<SysProfessionItemRespDto>(
        SysProfessionEntity,
        {
          select: ['id', 'name', 'orderNum', 'status'],
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

  async updateProfession(item: SysProfessionDeleteReqDto): Promise<void> {
    await this.entityManager.update(
      SysProfessionEntity,
      { id: item.id },
      omit(item, 'id'),
    );
  }
}
