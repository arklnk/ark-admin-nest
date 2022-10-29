import { Module } from '@nestjs/common';
import { SystemJobController } from './job.controller';
import { SystemJobService } from './job.service';

@Module({
  controllers: [SystemJobController],
  providers: [SystemJobService],
})
export class SystemJobModule {}
