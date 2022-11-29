import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemRoleController } from './role.controller';
import { SystemRoleService } from './role.service';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysRoleRepository } from '/@/repositories/sys-role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SysRoleEntity])],
  controllers: [SystemRoleController],
  providers: [SystemRoleService, SysRoleRepository],
})
export class SystemRoleModule {}
