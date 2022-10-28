import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ConfigDictAddReqDto,
  ConfigDictDataPageReqDto,
  ConfigDictIdDto,
  ConfigDictUpdateReqDto,
} from './dict.dto';
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

  @Get('list')
  async list() {
    return await this.dictService.getConfigDictList();
  }

  @Post('delete')
  async delete(@Body() body: ConfigDictIdDto) {
    await this.dictService.deleteConfigDict(body.id);
  }

  @Post('update')
  async update(@Body() body: ConfigDictUpdateReqDto) {
    await this.dictService.updateConfigDict(body);
  }
}
