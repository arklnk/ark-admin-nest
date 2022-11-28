import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysDeptRepositoryProvider } from '/@/repositories/sys-dept.repository';
import { SysRoleRepositoryProvider } from '/@/repositories/sys-role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SysRoleEntity, SysDeptEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    SysRoleRepositoryProvider,
    SysDeptRepositoryProvider,
  ],
})
export class UserModule {}
