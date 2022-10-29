import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SystemJobModule } from './job/job.module';
import { SystemProfessionModule } from './profession/profession.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'sys',
        children: [SystemJobModule, SystemProfessionModule],
      },
    ]),
    SystemJobModule,
    SystemProfessionModule,
  ],
})
export class SystemModule {}
