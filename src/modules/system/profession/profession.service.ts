import { Injectable } from '@nestjs/common';
import {
  SysProfessionAddReqDto,
  SysProfessionItemRespDto,
} from './profession.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysProfessionEntity } from '/@/entities/sys-profession.entity';

@Injectable()
export class SystemProfessionService extends AbstractService {
  async addProfession(item: SysProfessionAddReqDto): Promise<void> {
    await this.entityManager.insert(SysProfessionEntity, item);
  }

  async deleteProfession(id: number): Promise<void> {
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
}
