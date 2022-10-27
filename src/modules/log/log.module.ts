import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { LogLoginModule } from './login/login.module';

@Module({
  imports: [
    // register url prefix
    RouterModule.register([
      {
        path: 'log',
        children: [LogLoginModule],
      },
    ]),
    // register component
    LogLoginModule,
  ],
})
export class LogModule {}
