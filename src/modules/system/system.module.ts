import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SystemDeptModule } from './dept/dept.module';
import { SystemJobModule } from './job/job.module';
import { SystemPermMenuModule } from './permmenu/permmenu.module';
import { SystemProfessionModule } from './profession/profession.module';
import { SystemUserModule } from './user/user.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'sys',
        children: [
          SystemJobModule,
          SystemProfessionModule,
          SystemDeptModule,
          SystemPermMenuModule,
          SystemUserModule,
        ],
      },
    ]),
    SystemJobModule,
    SystemProfessionModule,
    SystemDeptModule,
    SystemPermMenuModule,
    SystemUserModule,
  ],
})
export class SystemModule {}
