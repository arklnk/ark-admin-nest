import { Module } from '@nestjs/common';
import { LoginLogController } from './login-log.controller';
import { LoginLogService } from './login-log.service';

@Module({
  controllers: [LoginLogController],
  providers: [LoginLogService],
})
export class LoginLogModule {}
