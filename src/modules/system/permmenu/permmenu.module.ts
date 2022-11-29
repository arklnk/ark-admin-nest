import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemPermMenuController } from './permmenu.controller';
import { SystemPermMenuService } from './permmenu.service';
import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysPermMenuRepository } from '/@/repositories/sys-perm-menu.repository';
import { SysRoleRepository } from '/@/repositories/sys-role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SysRoleEntity, SysPermMenuEntity])],
  controllers: [SystemPermMenuController],
  providers: [SystemPermMenuService, SysRoleRepository, SysPermMenuRepository],
})
export class SystemPermMenuModule {}
