import { Injectable } from '@nestjs/common';
import { SysRoleListItemRespDto } from './role.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysRoleEntity } from '/@/entities/sys-role.entity';

@Injectable()
export class SystemRoleService extends AbstractService {
  async getRoleByList() {
    const roles = await this.entityManager.find(SysRoleEntity);
    return roles.map((e) => new SysRoleListItemRespDto(e)).toList();
  }
}
