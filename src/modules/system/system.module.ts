import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SystemDeptModule } from './dept/dept.module';
import { SystemJobModule } from './job/job.module';
import { SystemPermMenuModule } from './permmenu/permmenu.module';
import { SystemProfessionModule } from './profession/profession.module';
import { SystemRoleModule } from './role/role.module';
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
          SystemRoleModule,
        ],
      },
    ]),
    SystemJobModule,
    SystemProfessionModule,
    SystemDeptModule,
    SystemPermMenuModule,
    SystemUserModule,
    SystemRoleModule,
  ],
})
export class SystemModule {}
