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
   * @description 检查当前用户是否为超级管理员
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

  /**
   * @description 获取所有的超级管理员用户ID列表
   */
  async getAllSuperAdminUserIds(): Promise<number[]> {
    const users = await this.entityManager
      .createQueryBuilder(SysUserEntity, 'user')
      .select(['user.id'])
      .where('JSON_CONTAINS(user.role_ids, CONCAT(:id))', {
        id: this.configService.appConfig.rootRoleId,
      })
      .getMany();
    return users.map((u) => u.id);
  }
}
