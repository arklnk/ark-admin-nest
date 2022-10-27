import { Module } from '@nestjs/common';
import { ConfigDictController } from './dict.controller';
import { ConfigDictService } from './dict.service';

@Module({
  controllers: [ConfigDictController],
  providers: [ConfigDictService],
})
export class ConfigDictModule {}
