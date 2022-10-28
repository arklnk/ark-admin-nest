import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ConfigDictAddReqDto, ConfigDictDataPageReqDto } from './dict.dto';
import { ConfigDictService } from './dict.service';

@Controller('dict')
export class ConfigDictController {
  constructor(private dictService: ConfigDictService) {}

  @Post('add')
  async add(@Body() body: ConfigDictAddReqDto) {
    await this.dictService.addConfigDict(body);
  }

  @Get('data/page')
  async dataPage(@Query() query: ConfigDictDataPageReqDto) {
    return await this.dictService.getConfigDictDataByPage(
      query.page,
      query.limit,
      query.parentId,
    );
  }
}
