import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { LogLoginModule } from './login/login.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'log',
        children: [LogLoginModule],
      },
    ]),
    LogLoginModule,
  ],
})
export class LogModule {}
