import { Injectable } from '@nestjs/common';
import { isEmpty, omit } from 'lodash';
import {
  SysPermMenuAddReqDto,
  SysPermMenuDeleteReqDto,
  SysPermMenuItemRespDto,
  SysPermMenuUpdateReqDto,
} from './permmenu.dto';
import { AbstractService } from '/@/common/abstract.service';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { ErrorEnum } from '/@/constants/errorx';
import { SysMenuTypeEnum } from '/@/constants/type';
import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { ApiFailedException } from '/@/exceptions/api-failed.exception';
import { SysPermMenuRepository } from '/@/repositories/sys-perm-menu.repository';
import { AppConfigService } from '/@/shared/services/app-config.service';

@Injectable()
export class SystemPermMenuService extends AbstractService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly sysPermMenuRepo: SysPermMenuRepository,
  ) {
    super();
  }

  async getPermMenuByList() {
    const permmenus = await this.entityManager.find(SysPermMenuEntity, {
      select: [
        'activeRouter',
        'icon',
        'id',
        'isShow',
        'name',
        'orderNum',
        'parentId',
        'perms',
        'router',
        'type',
        'viewPath',
      ],
    });

    return permmenus.map((e) => new SysPermMenuItemRespDto(e)).toList();
  }

  async deletePermMenu(item: SysPermMenuDeleteReqDto): Promise<void> {
    // 检查是否为保护的保护的菜单ID
    if (item.id <= this.configService.appConfig.protectSysPermMenuMaxId) {
      throw new ApiFailedException(ErrorEnum.CODE_1112);
    }

    // 检查是否有含有子项
    const count = await this.entityManager.count(SysPermMenuEntity, {
      where: {
        parentId: item.id,
      },
    });

    if (count > 0) {
      throw new ApiFailedException(ErrorEnum.CODE_1113);
    }

    await this.entityManager.delete(SysPermMenuEntity, { id: item.id });
  }

  async addPermMenu(item: SysPermMenuAddReqDto): Promise<void> {
    await this.checkPermMenuParentInvalid(item.parentId);

    await this.entityManager.insert(SysPermMenuEntity, {
      ...omit(item, 'perms'),
      perms: JSON.stringify(item.perms),
    });
  }

  async updatePermMenu(item: SysPermMenuUpdateReqDto): Promise<void> {
    // 检查是否为保护的保护的菜单ID
    if (item.id <= this.configService.appConfig.protectSysPermMenuMaxId) {
      throw new ApiFailedException(ErrorEnum.CODE_1112);
    }

    if (item.id === item.parentId) {
      throw new ApiFailedException(ErrorEnum.CODE_1115);
    }

    await this.checkPermMenuParentInvalid(item.parentId);

    // 查找未修改前权限菜单ID所有的子项，防止将父级菜单修改成自己的子项导致数据丢失
    const allSubPermMenuIds: number[] =
      await this.sysPermMenuRepo.findAllSubIds(item.id);

    if (allSubPermMenuIds.includes(item.parentId)) {
      throw new ApiFailedException(ErrorEnum.CODE_1116);
    }

    await this.entityManager.update(
      SysPermMenuEntity,
      { id: item.id },
      {
        ...omit(item, ['id', 'perms']),
        perms: JSON.stringify(item.perms),
      },
    );
  }

  /**
   * 检查父级权限菜单ID合法性，不存在或权限不能作为父级菜单
   */
  private async checkPermMenuParentInvalid(pid: number): Promise<void> {
    if (pid === TREE_ROOT_NODE_ID) return;

    const parent = await this.entityManager.findOne(SysPermMenuEntity, {
      select: ['id', 'type'],
      where: {
        id: pid,
      },
    });

    if (isEmpty(parent)) {
      throw new ApiFailedException(ErrorEnum.CODE_1117);
    }

    if (parent.type === SysMenuTypeEnum.Permission) {
      throw new ApiFailedException(ErrorEnum.CODE_1118);
    }
  }
}
