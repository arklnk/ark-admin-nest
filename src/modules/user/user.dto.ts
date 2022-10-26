import type { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { NumberField, StringField } from '/@/decorators/field.decorator';

export class UserLoginCaptchaReqDto {
  @NumberField({
    required: false,
  })
  width?: number;

  @NumberField({
    required: false,
  })
  height?: number;
}

export class UserLoginReqDto {
  @StringField()
  captchaId: string;

  @StringField({
    lowerCase: true,
  })
  verifyCode: string;

  @StringField()
  account: string;

  @StringField()
  password: string;
}

//-------------------------------------------------------------------------------
//------------------------------------- res -------------------------------------
//-------------------------------------------------------------------------------

export class UserPermMenuResDto {
  menus: SysPermMenuEntity[];
  perms: string[];

  constructor(dto: UserPermMenuResDto) {
    this.menus = dto.menus;
    this.perms = dto.perms;
  }
}

export class UserLoginCaptchaResDto {
  img: string;
  id: string;

  constructor(dto: UserLoginCaptchaResDto) {
    this.img = dto.img;
    this.id = dto.id;
  }
}

export class UserLoginResDto {
  token: string;

  constructor(dto: UserLoginResDto) {
    this.token = dto.token;
  }
}
