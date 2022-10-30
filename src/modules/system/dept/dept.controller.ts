import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SysDeptAddReqDto, SysDeptDeleteReqDto } from './dept.dto';
import { SystemDeptService } from './dept.service';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('System department - 系统部门')
@ApiSecurityAuth()
@Controller('dept')
export class SystemDeptController {
  constructor(private deptService: SystemDeptService) {}

  @Post('add')
  @ApiOkResponse()
  async add(@Body() body: SysDeptAddReqDto) {
    await this.deptService.addDept(body);
  }

  @Post('delete')
  @ApiOkResponse()
  async delete(@Body() body: SysDeptDeleteReqDto) {
    await this.deptService.deleteDept(body.id);
  }
}
