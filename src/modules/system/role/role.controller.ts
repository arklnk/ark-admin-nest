import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SysRoleListItemRespDto } from './role.dto';
import { SystemRoleService } from './role.service';
import { wrapResponse } from '/@/common/utils/swagger';
import { ApiSecurityAuth } from '/@/decorators/swagger.decorator';

@ApiTags('System role - 系统角色')
@ApiSecurityAuth()
@Controller('role')
export class SystemRoleController {
  constructor(private roleService: SystemRoleService) {}

  @Get('list')
  @ApiOkResponse({
    type: wrapResponse({
      type: SysRoleListItemRespDto,
      struct: 'list',
    }),
  })
  async list() {
    return this.roleService.getRoleByList();
  }
}
