import { Controller, Get, Query } from '@nestjs/common';
import { LogLoginService } from './login.service';
import { PageOptionsDto } from '/@/common/dto/page-options.dto';

@Controller('login')
export class LogLoginController {
  constructor(private logService: LogLoginService) {}

  @Get('page')
  async page(@Query() query: PageOptionsDto) {
    return await this.logService.getLoginLogByPage(query.page, query.limit);
  }
}
