import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SysProfessionAddReqDto } from './profession.dto';
import { SystemProfessionService } from './profession.service';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('System profession - 系统职称')
@ApiSecurityAuth()
@Controller('profession')
export class SystemProfessionController {
  constructor(private profService: SystemProfessionService) {}

  @Post('add')
  @ApiOkResponse()
  async add(@Body() body: SysProfessionAddReqDto) {
    await this.profService.addProfession(body);
  }
}
