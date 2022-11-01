import { Module } from '@nestjs/common';
import { SystemUserController } from './user.controller';
import { SystemUserService } from './user.service';

@Module({
  controllers: [SystemUserController],
  providers: [SystemUserService],
})
export class SystemUserModule {}
