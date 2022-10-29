import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import {
  SysJobAddReqDto,
  SysJobItemRespDto,
  SysJobUpdateReqDto,
} from './job.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysJobEntity } from '/@/entities/sys-job.entity';

@Injectable()
export class SystemJobService extends AbstractService {
  async addJob(item: SysJobAddReqDto): Promise<void> {
    await this.entityManager.insert(SysJobEntity, item);
  }

  async deleteJob(id: number): Promise<void> {
    await this.entityManager.delete(SysJobEntity, { id });
  }

  async getJobByPage(page: number, limit: number) {
    const [rows, count] =
      await this.entityManager.findAndCount<SysJobItemRespDto>(SysJobEntity, {
        select: ['id', 'name', 'orderNum', 'status'],
        skip: (page - 1) * limit,
        take: limit,
      });

    return rows.toPage({
      page,
      limit,
      total: count,
    });
  }

  async updateJob(item: SysJobUpdateReqDto): Promise<void> {
    await this.entityManager.update(
      SysJobEntity,
      { id: item.id },
      omit(item, 'id'),
    );
  }
}
