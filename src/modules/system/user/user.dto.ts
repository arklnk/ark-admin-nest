import type { ISystemUserPageQueryRowItem } from './user.interface';
import { PageOptionsDto } from '/@/common/dto/page-options.dto';
import { NumberField } from '/@/decorators/field.decorator';

export class SysUserPageReqDto extends PageOptionsDto {
  @NumberField({
    int: true,
    min: 0,
  })
  deptId: number;
}

//--------------------------------------------------------------------------------
//------------------------------------- resp -------------------------------------
//--------------------------------------------------------------------------------

export class IdNameInfoDto {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class SysUserPageItemRespDto {
  id: number;
  account: string;
  email: string;
  gender: number;
  mobile: string;
  nickname: string;
  orderNum: number;
  remark: string;
  status: number;
  username: string;
  dept: IdNameInfoDto;
  profession: IdNameInfoDto;
  job: IdNameInfoDto;
  roles: IdNameInfoDto[];

  constructor(entity: ISystemUserPageQueryRowItem) {
    this.id = entity.id;
    this.account = entity.account;
    this.email = entity.email;
    this.gender = entity.gender;
    this.mobile = entity.mobile;
    this.nickname = entity.nickname;
    this.orderNum = entity.orderNum;
    this.remark = entity.remark;
    this.status = entity.status;
    this.username = entity.username;
    this.dept = new IdNameInfoDto(entity.deptId, entity.deptName);
    this.profession = new IdNameInfoDto(
      entity.professionId,
      entity.professionName,
    );
    this.job = new IdNameInfoDto(entity.jobId, entity.jobName);
    const roleIds = entity.roleIds.split(',').map((e) => Number.parseInt(e));
    const roleNames = entity.roleNames.split(',');
    const roles: IdNameInfoDto[] = [];
    for (let i = 0; i < roleIds.length; i++) {
      roles.push(new IdNameInfoDto(roleIds[i], roleNames[i]));
    }
    this.roles = roles;
  }
}
