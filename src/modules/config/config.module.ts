import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ConfigDictModule } from './dict/dict.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'config',
        children: [ConfigDictModule],
      },
    ]),
    ConfigDictModule,
  ],
})
export class ConfigModule {}
