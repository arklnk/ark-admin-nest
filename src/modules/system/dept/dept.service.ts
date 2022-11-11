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
    await this.checkParentDeptInvalid(item.parentId);

    await this.entityManager.insert(SysDeptEntity, item);
  }

  async deleteDept(id: number): Promise<void> {
    const countChild = await this.entityManager.count(SysDeptEntity, {
      where: {
        parentId: id,
      },
    });

    if (countChild > 0) {
      throw new ApiFailedException(ErrorEnum.CODE_1122);
    }

    const countUse = await this.entityManager.count(SysUserEntity, {
      where: {
        deptId: id,
      },
    });

    if (countUse > 0) {
      throw new ApiFailedException(ErrorEnum.CODE_1123);
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
    await this.checkParentDeptInvalid(item.parentId);

    if (item.parentId === item.id) {
      throw new ApiFailedException(ErrorEnum.CODE_1124);
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
      throw new ApiFailedException(ErrorEnum.CODE_1125);
    }

    await this.entityManager.update(
      SysDeptEntity,
      { id: item.id },
      omit(item, 'id'),
    );
  }

  /**
   * 检查父级部门是否合法
   */
  private async checkParentDeptInvalid(id: number): Promise<void> {
    if (id === TREE_ROOT_NODE_ID) return;

    const parent = await this.entityManager.findOne(SysDeptEntity, {
      select: ['id'],
      where: {
        id,
      },
    });
    if (!isEmpty(parent)) {
      throw new ApiFailedException(ErrorEnum.CODE_1121);
    }
  }
}
