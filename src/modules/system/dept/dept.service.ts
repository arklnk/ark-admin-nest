import { Injectable } from '@nestjs/common';
import { isEmpty, omit } from 'lodash';
import {
  SysDeptAddReqDto,
  SysDeptItemRespDto,
  SysDeptUpdateReqDto,
} from './dept.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { ErrorEnum } from '/@/constants/errorx';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';

@Injectable()
export class SystemDeptService extends AbstractService {
  async addDept(item: SysDeptAddReqDto): Promise<void> {
    if (item.parentId !== TREE_ROOT_NODE_ID) {
      const exists = await this.findItemExists(item.parentId);
      if (!exists) {
        throw new ApiFailedException(ErrorEnum.ParentDeptIdErrorCode);
      }
    }

    await this.entityManager.insert(SysDeptEntity, item);
  }

  async deleteDept(id: number): Promise<void> {
    const countChild = await this.entityManager.count(SysDeptEntity, {
      where: {
        parentId: id,
      },
    });
    if (countChild > 0) {
      throw new ApiFailedException(ErrorEnum.DeleteDeptErrorCode);
    }

    const countUse = await this.entityManager.count(SysUserEntity, {
      where: {
        deptId: id,
      },
    });
    if (countUse > 0) {
      throw new ApiFailedException(ErrorEnum.DeptHasUserErrorCode);
    }

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

  async updateDept(item: SysDeptUpdateReqDto) {
    if (item.parentId !== TREE_ROOT_NODE_ID) {
      const exists = await this.findItemExists(item.parentId);
      if (!exists) {
        throw new ApiFailedException(ErrorEnum.ParentDeptIdErrorCode);
      }
    }

    // 查找未修改前部门ID所有的子项，防止将父级菜单修改成自己的子项导致数据丢失
    let lastQueryIds: number[] = [item.id];
    const allSubDeptIds: number[] = [];

    do {
      const pmIds = await this.entityManager
        .createQueryBuilder(SysDeptEntity, 'dept')
        .select(['dept.id'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      lastQueryIds = pmIds.map((e) => e.id);
      allSubDeptIds.push(...lastQueryIds);
    } while (lastQueryIds.length > 0);

    if (allSubDeptIds.includes(item.parentId)) {
      throw new ApiFailedException(ErrorEnum.SetParentIdErrorCode);
    }

    await this.entityManager.update(
      SysDeptEntity,
      { id: item.id },
      omit(item, 'id'),
    );
  }

  async findItemExists(id: number): Promise<boolean> {
    const parent = await this.entityManager.findOne(SysDeptEntity, {
      select: ['id'],
      where: {
        id,
      },
    });
    return !isEmpty(parent);
  }
}
