import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  SysPermMenuAddReqDto,
  SysPermMenuDeleteReqDto,
  SysPermMenuItemRespDto,
  SysPermMenuUpdateReqDto,
} from './permmenu.dto';
import { SystemPermMenuService } from './permmenu.service';
import { wrapResponse } from '/@/common/utils/swagger';
import { AuthUser } from '/@/decorators/auth-user.decorator';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('System permission and menu - 系统权限及菜单')
@ApiSecurityAuth()
@Controller('perm/menu')
export class SystemPermMenuController {
  constructor(private pmService: SystemPermMenuService) {}

  @Get('list')
  @ApiOkResponse({
    type: wrapResponse({
      type: SysPermMenuItemRespDto,
      struct: 'list',
    }),
  })
  async list(@AuthUser('uid') uid: number) {
    return await this.pmService.getPermMenuByList(uid);
  }

  @Post('delete')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async delete(
    @AuthUser('uid') uid: number,
    @Body() body: SysPermMenuDeleteReqDto,
  ) {
    await this.pmService.deletePermMenu(uid, body);
  }

  @Post('add')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async add(@AuthUser('uid') uid: number, @Body() body: SysPermMenuAddReqDto) {
    await this.pmService.addPermMenu(uid, body);
  }

  @Post('update')
  @ApiOkResponse({
    type: wrapResponse(),
  })
  async update(
    @AuthUser('uid') uid: number,
    @Body() body: SysPermMenuUpdateReqDto,
  ) {
    await this.pmService.updatePermMenu(uid, body);
  }
}
