import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SysJobAddReqDto } from './job.dto';
import { SystemJobService } from './job.service';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('System job - 系统岗位')
@ApiSecurityAuth()
@Controller('job')
export class SystemJobController {
  constructor(private jobService: SystemJobService) {}

  @Post('add')
  @ApiOkResponse()
  async add(@Body() body: SysJobAddReqDto) {
    await this.jobService.addJob(body);
  }
}
