import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  SysUserAddReqDto,
  SysUserDeleteReqDto,
  SysUserPageItemRespDto,
  SysUserPageReqDto,
  SysUserPasswordUpdateReqDto,
  SysUserRdpjInfoReqDto,
  SysUserRdpjInfoRespDto,
  SysUserUpdateReqDto,
} from './user.dto';
import { SystemUserService } from './user.service';
import { wrapResponse } from '/@/common/utils/swagger';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('System user - 系统用户')
@ApiSecurityAuth()
@Controller('user')
export class SystemUserController {
  constructor(private userService: SystemUserService) {}

  @Get('page')
  @ApiOkResponse({
    type: wrapResponse({
      type: SysUserPageItemRespDto,
      struct: 'page',
    }),
  })
  async page(@Query() query: SysUserPageReqDto) {
    return await this.userService.getUserByPage(
      query.page,
      query.limit,
      query.deptId,
    );
  }

  @Post('password/update')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async passwordUpdate(@Body() body: SysUserPasswordUpdateReqDto) {
    await this.userService.updateUserPassword(body.id, body.password);
  }

  @Post('delete')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async delete(@Body() body: SysUserDeleteReqDto) {
    await this.userService.deleteUser(body.id);
  }

  @Get('rdpj/info')
  @ApiOkResponse({
    type: wrapResponse({
      type: SysUserRdpjInfoRespDto,
    }),
  })
  async rdpjInfo(@Query() query: SysUserRdpjInfoReqDto) {
    return await this.userService.getUserRoleDeptProfJobInfo(query.userId);
  }

  @Post('add')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async add(@Body() body: SysUserAddReqDto) {
    await this.userService.addUser(body);
  }

  @Post('update')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async update(@Body() body: SysUserUpdateReqDto) {
    await this.userService.updateUser(body);
  }
}
