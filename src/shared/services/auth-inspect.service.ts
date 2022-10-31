import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isEmpty } from 'lodash';
import { EntityManager } from 'typeorm';
import { AppConfigService } from './app-config.service';
import { SysUserEntity } from '/@/entities/sys-user.entity';

@Injectable()
export class AuthInspectService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  constructor(private configService: AppConfigService) {}

  /**
   * @description Check whether the administrator is the super administrator
   */
  async inspectSuperAdmin(uid: number, roleIds?: number[]): Promise<boolean> {
    if (!Array.isArray(roleIds)) {
      const user = await this.entityManager.findOne(SysUserEntity, {
        select: ['roleIds'],
        where: {
          id: uid,
        },
      });

      if (isEmpty(user)) {
        throw new Error(`user id: ${uid} is not exists`);
      }

      roleIds = user.roleIds;
    }

    return roleIds.includes(this.configService.appConfig.rootRoleId);
  }
}
