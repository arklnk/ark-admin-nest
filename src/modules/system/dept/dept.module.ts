import { Module } from '@nestjs/common';
import { SystemDeptController } from './dept.controller';
import { SystemDeptService } from './dept.service';

@Module({
  controllers: [SystemDeptController],
  providers: [SystemDeptService],
})
export class SystemDeptModule {}
