import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemPermMenuController } from './permmenu.controller';
import { SystemPermMenuService } from './permmenu.service';
import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { SysPermMenuRepository } from '/@/repositories/sys-perm-menu.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SysPermMenuEntity])],
  controllers: [SystemPermMenuController],
  providers: [SystemPermMenuService, SysPermMenuRepository],
})
export class SystemPermMenuModule {}
