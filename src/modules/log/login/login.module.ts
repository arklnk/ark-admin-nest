import { Module } from '@nestjs/common';
import { LogLoginController } from './login.controller';
import { LogLoginService } from './login.service';

@Module({
  controllers: [LogLoginController],
  providers: [LogLoginService],
})
export class LogLoginModule {}
