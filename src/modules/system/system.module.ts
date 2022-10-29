import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SystemJobModule } from './job/job.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'sys',
        children: [SystemJobModule],
      },
    ]),
    SystemJobModule,
  ],
})
export class SystemModule {}
