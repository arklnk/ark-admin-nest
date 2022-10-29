import { Module } from '@nestjs/common';
import { SystemProfessionController } from './profession.controller';
import { SystemProfessionService } from './profession.service';

@Module({
  controllers: [SystemProfessionController],
  providers: [SystemProfessionService],
})
export class SystemProfessionModule {}
