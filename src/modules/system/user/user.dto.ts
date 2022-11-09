import { OmitType } from '@nestjs/swagger';
import type { ISystemUserPageQueryRowItem } from './user.interface';
import { PageOptionsDto } from '/@/common/dtos/page-options.dto';
import { NumberField, StringField } from '/@/decorators/field.decorator';
import { SysRoleEntity } from '/@/entities/sys-role.entity';

export class SysUserPageReqDto extends PageOptionsDto {
  @NumberField({
    int: true,
    min: 0,
  })
  deptId: number;
}

export class SysUserPasswordUpdateReqDto {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;

  @StringField({
    minLength: 6,
    maxLength: 12,
  })
  password: string;
}

export class SysUserDeleteReqDto {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
}

export class SysUserRdpjInfoReqDto {
  @NumberField({
    int: true,
    min: 0,
    required: false,
  })
  userId: number;
}

export class SysUserAddReqDto {
  @StringField({
    minLength: 4,
    maxLength: 50,
  })
  account: string;

  @NumberField({
    min: 1,
  })
  deptId: number;

  @StringField({
    required: false,
  })
  email?: string;

  @NumberField({
    min: 0,
    max: 2,
  })
  gender: number;

  @NumberField({
    min: 1,
  })
  jobId: number;

  @StringField({
    required: false,
  })
  mobile?: string;

  @StringField({
    required: false,
  })
  nickname?: string;

  @NumberField({
    min: 0,
    required: false,
  })
  orderNum?: number;

  @NumberField({
    min: 0,
  })
  professionId: number;

  @StringField({
    required: false,
  })
  remark?: string;

  @NumberField({
    each: true,
    int: true,
    min: 1,
  })
  roleIds: number[];

  @NumberField({
    min: 0,
    max: 1,
  })
  status: number;

  @StringField()
  username: string;
}

export class SysUserUpdateReqDto extends OmitType(SysUserAddReqDto, [
  'account',
] as const) {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
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

export class DeptInfoDto extends IdNameInfoDto {
  parentId: number;

  constructor(id: number, name: string, parentId: number) {
    super(id, name);
    this.parentId = parentId;
  }
}

export class RoleInfoDto extends IdNameInfoDto {
  parentId: number;
  has: number;

  constructor(entity: SysRoleEntity, has: number) {
    super(entity.id, entity.name);
    this.parentId = entity.parentId;
    this.has = has;
  }
}

export class SysUserRdpjInfoRespDto {
  profession: IdNameInfoDto[];
  dept: DeptInfoDto[];
  job: IdNameInfoDto[];
  role: RoleInfoDto[];

  constructor(
    profs: IdNameInfoDto[],
    depts: DeptInfoDto[],
    jobs: IdNameInfoDto[],
    roles: RoleInfoDto[],
  ) {
    this.profession = profs;
    this.dept = depts;
    this.job = jobs;
    this.role = roles;
  }
}
