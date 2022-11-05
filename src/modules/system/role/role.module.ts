import { Module } from '@nestjs/common';
import { SystemRoleController } from './role.controller';
import { SystemRoleService } from './role.service';

@Module({
  controllers: [SystemRoleController],
  providers: [SystemRoleService],
})
export class SystemRoleModule {}
