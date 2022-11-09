import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  SysJobAddReqDto,
  SysJobDeleteReqDto,
  SysJobItemRespDto,
  SysJobUpdateReqDto,
} from './job.dto';
import { SystemJobService } from './job.service';
import { PageOptionsDto } from '/@/common/dtos/page-options.dto';
import { wrapResponse } from '/@/common/utils/swagger';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('System job - 系统岗位')
@ApiSecurityAuth()
@Controller('job')
export class SystemJobController {
  constructor(private jobService: SystemJobService) {}

  @Post('add')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async add(@Body() body: SysJobAddReqDto) {
    await this.jobService.addJob(body);
  }

  @Post('delete')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async delete(@Body() body: SysJobDeleteReqDto) {
    await this.jobService.deleteJob(body.id);
  }

  @Get('page')
  @ApiOkResponse({
    type: wrapResponse({
      type: SysJobItemRespDto,
      struct: 'page',
    }),
  })
  async page(@Query() query: PageOptionsDto) {
    return await this.jobService.getJobByPage(query.page, query.limit);
  }

  @Post('update')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async update(@Body() body: SysJobUpdateReqDto) {
    await this.jobService.updateJob(body);
  }
}
