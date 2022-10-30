import { Module } from '@nestjs/common';
import { SystemPermMenuController } from './permmenu.controller';
import { SystemPermMenuService } from './permmenu.service';

@Module({
  controllers: [SystemPermMenuController],
  providers: [SystemPermMenuService],
})
export class SystemPermMenuModule {}
