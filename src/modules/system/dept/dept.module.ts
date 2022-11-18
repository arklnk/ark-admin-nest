import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemDeptController } from './dept.controller';
import { SystemDeptService } from './dept.service';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { SysDeptRepositoryProvider } from '/@/repositories/sys-dept.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SysDeptEntity])],
  controllers: [SystemDeptController],
  providers: [SystemDeptService, SysDeptRepositoryProvider],
})
export class SystemDeptModule {}
