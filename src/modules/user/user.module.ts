import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SysLog } from '/@/entities/sys-log.entity';
import { SysPermMenu } from '/@/entities/sys-perm-menu.entity';
import { SysUser } from '/@/entities/sys-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysUser, SysPermMenu, SysLog])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
