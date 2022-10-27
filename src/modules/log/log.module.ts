import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { LoginLogModule } from './login/login-log.module';

@Module({
  imports: [
    // register url prefix
    RouterModule.register([
      {
        path: 'log',
        children: [LoginLogModule],
      },
    ]),
    // register component
    LoginLogModule,
  ],
})
export class LogModule {}
