import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  SysDeptAddReqDto,
  SysDeptDeleteReqDto,
  SysDeptItemRespDto,
} from './dept.dto';
import { SystemDeptService } from './dept.service';
import { wrapResponse } from '/@/common/utils/swagger';
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

  @Get('list')
  @ApiOkResponse({
    type: wrapResponse({
      type: SysDeptItemRespDto,
      struct: 'list',
    }),
  })
  async list() {
    return await this.deptService.getDeptByList();
  }
}
