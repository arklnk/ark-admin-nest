import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LogLoginRespItemDto } from './login.dto';
import { LogLoginService } from './login.service';
import { PageOptionsDto } from '/@/common/dto/page-options.dto';
import { wrapResponse } from '/@/common/utils/swagger';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiSecurityAuth()
@ApiTags('Login log - 登录日志')
@Controller('login')
export class LogLoginController {
  constructor(private logService: LogLoginService) {}

  @Get('page')
  @ApiOkResponse({
    type: wrapResponse({ type: LogLoginRespItemDto, struct: 'page' }),
  })
  async page(@Query() query: PageOptionsDto) {
    return await this.logService.getLoginLogByPage(query.page, query.limit);
  }
}
