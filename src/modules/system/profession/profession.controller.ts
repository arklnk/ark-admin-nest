import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  SysProfessionAddReqDto,
  SysProfessionDeleteReqDto,
  SysProfessionItemRespDto,
  SysProfessionUpdateReqDto,
} from './profession.dto';
import { SystemProfessionService } from './profession.service';
import { PageOptionsDto } from '/@/common/dtos/page-options.dto';
import { wrapResponse } from '/@/common/utils/swagger';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('System profession - 系统职称')
@ApiSecurityAuth()
@Controller('profession')
export class SystemProfessionController {
  constructor(private profService: SystemProfessionService) {}

  @Post('add')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async add(@Body() body: SysProfessionAddReqDto) {
    await this.profService.addProfession(body);
  }

  @Post('delete')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async delete(@Body() body: SysProfessionDeleteReqDto) {
    await this.profService.deleteProfession(body.id);
  }

  @Get('page')
  @ApiOkResponse({
    type: wrapResponse({
      type: SysProfessionItemRespDto,
      struct: 'page',
    }),
  })
  async page(@Query() query: PageOptionsDto) {
    return await this.profService.getProfessionByPage(query.page, query.limit);
  }

  @Post('update')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async update(@Body() body: SysProfessionUpdateReqDto) {
    await this.profService.updateProfession(body);
  }
}
