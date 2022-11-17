import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SysRoleEntity } from '/@/entities/sys-role.entity';
import { SysRoleRepositoryProvider } from '/@/repositories/sys-role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SysRoleEntity])],
  controllers: [UserController],
  providers: [UserService, SysRoleRepositoryProvider],
})
export class UserModule {}
