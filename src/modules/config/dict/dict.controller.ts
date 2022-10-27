import { Body, Controller, Post } from '@nestjs/common';
import { ConfigDictAddReqDto } from './dict.dto';
import { ConfigDictService } from './dict.service';

@Controller('dict')
export class ConfigDictController {
  constructor(private dictService: ConfigDictService) {}

  @Post('add')
  async add(@Body() body: ConfigDictAddReqDto) {
    await this.dictService.addConfigDict(body);
  }
}
