import { Injectable } from '@nestjs/common';
import { SysRoleListItemRespDto } from './role.dto';
import { AbstractService } from '/@/common/abstract.service';
import { ErrorEnum } from '/@/constants/errorx';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';

@Injectable()
export class SystemRoleService extends AbstractService {
  async getRoleByList() {
    const roles = await this.entityManager.find(SysRoleEntity);
    return roles.map((e) => new SysRoleListItemRespDto(e)).toList();
  }

  async deleteRole(roleId: number): Promise<void> {
    const countChild = await this.entityManager.count(SysRoleEntity, {
      where: {
        parentId: roleId,
      },
    });

    if (countChild > 0) {
      throw new ApiFailedException(ErrorEnum.DeleteRoleErrorCode);
    }

    const countUse = await this.entityManager
      .createQueryBuilder(SysUserEntity, 'user')
      .select('COUNT(user.id)')
      .where('JSON_CONTAINS(user.role_ids, JSON_ARRAY(:id))', { id: roleId })
      .getCount();

    if (countUse > 0) {
      throw new ApiFailedException(ErrorEnum.RoleIsUsingErrorCode);
    }

    await this.entityManager.delete(SysRoleEntity, { id: roleId });
  }
}
