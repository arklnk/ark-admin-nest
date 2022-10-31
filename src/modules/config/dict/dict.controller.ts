import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  ConfigDictAddReqDto,
  ConfigDictDataPageReqDto,
  ConfigDictIdDto,
  ConfigDictRespItemDto,
  ConfigDictUpdateReqDto,
} from './dict.dto';
import { ConfigDictService } from './dict.service';
import { wrapResponse } from '/@/common/utils/swagger';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiSecurityAuth()
@ApiTags('Dictionary config - 字典配置')
@Controller('dict')
export class ConfigDictController {
  constructor(private dictService: ConfigDictService) {}

  @Post('add')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async add(@Body() body: ConfigDictAddReqDto) {
    await this.dictService.addConfigDict(body);
  }

  @Get('data/page')
  @ApiOkResponse({
    type: wrapResponse({
      type: ConfigDictRespItemDto,
      struct: 'page',
    }),
  })
  async dataPage(@Query() query: ConfigDictDataPageReqDto) {
    return await this.dictService.getConfigDictDataByPage(
      query.page,
      query.limit,
      query.parentId,
    );
  }

  @Get('list')
  @ApiOkResponse({
    type: wrapResponse({
      type: ConfigDictRespItemDto,
      struct: 'list',
    }),
  })
  async list() {
    return await this.dictService.getConfigDictList();
  }

  @Post('delete')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async delete(@Body() body: ConfigDictIdDto) {
    await this.dictService.deleteConfigDict(body.id);
  }

  @Post('update')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async update(@Body() body: ConfigDictUpdateReqDto) {
    await this.dictService.updateConfigDict(body);
  }
}
