import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemUserController } from './user.controller';
import { SystemUserService } from './user.service';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { SysDeptRepository } from '/@/repositories/sys-dept.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SysDeptEntity])],
  controllers: [SystemUserController],
  providers: [SystemUserService, SysDeptRepository],
})
export class SystemUserModule {}
