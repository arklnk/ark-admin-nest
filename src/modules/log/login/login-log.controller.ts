import { Controller, Get, Query } from '@nestjs/common';
import { LoginLogService } from './login-log.service';
import { PageOptionsDto } from '/@/common/dto/page-options.dto';

@Controller('login')
export class LoginLogController {
  constructor(private loginLogService: LoginLogService) {}

  @Get('page')
  async page(@Query() query: PageOptionsDto) {
    return await this.loginLogService.getLoginLogByPage(
      query.page,
      query.limit,
    );
  }
}
