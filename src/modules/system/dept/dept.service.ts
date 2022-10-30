import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { SysDeptAddReqDto, SysDeptItemRespDto } from './dept.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { ErrorEnum } from '/@/constants/errorx';

@Injectable()
export class SystemDeptService extends AbstractService {
  async addDept(item: SysDeptAddReqDto): Promise<void> {
    if (item.parentId !== 0) {
      const parent = await this.entityManager.findOne(SysDeptEntity, {
        select: ['id'],
        where: {
          id: item.parentId,
        },
      });
      if (isEmpty(parent)) {
        throw new ApiFailedException(ErrorEnum.ParentDeptIdErrorCode);
      }
    }

    await this.entityManager.insert(SysDeptEntity, item);
  }

  async deleteDept(id: number): Promise<void> {
    await this.entityManager.delete(SysDeptEntity, { id });
  }

  async getDeptByList() {
    const rows = await this.entityManager.find<SysDeptItemRespDto>(
      SysDeptEntity,
      {
        select: [
          'fullName',
          'id',
          'name',
          'orderNum',
          'parentId',
          'remark',
          'status',
          'type',
          'uniqueKey',
        ],
      },
    );
    return rows.toList();
  }
}
