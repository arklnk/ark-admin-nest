import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
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

export class UserProfileUpdateReqDto {
  @StringField({ minLength: 2, maxLength: 12 })
  username: string;

  @StringField({ minLength: 2, maxLength: 12 })
  nickname: string;

  @NumberField({ int: true, min: 0, max: 2 })
  gender: number;

  @StringField({ required: false })
  email: string;

  @StringField({ required: false })
  mobile: string;

  @StringField()
  avatar: string;
}

export class UserPasswordUpdateReqDto {
  @StringField({
    minLength: 6,
    maxLength: 12,
  })
  oldPassword: string;

  @StringField({
    minLength: 6,
    maxLength: 12,
  })
  newPassword: string;
}

//--------------------------------------------------------------------------------
//------------------------------------- resp -------------------------------------
//--------------------------------------------------------------------------------

export class UserPermMenuRespDto {
  menus: SysPermMenuEntity[];
  perms: string[];

  constructor(menus: SysPermMenuEntity[], perms: string[]) {
    this.menus = menus;
    this.perms = perms;
  }
}

export class UserLoginCaptchaRespDto {
  verifyCode: string;
  captchaId: string;

  constructor(verifyCode: string, captchaId: string) {
    this.verifyCode = verifyCode;
    this.captchaId = captchaId;
  }
}

export class UserLoginRespDto {
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}

export class UserInfoRespDto {
  avatar: string;
  username: string;

  constructor(userEntiry: SysUserEntity) {
    this.avatar = userEntiry.avatar;
    this.username = userEntiry.username;
  }
}

export class UserProfileInfoRespDto {
  avatar: string;
  email: string;
  gender: number;
  mobile: string;
  nickname: string;
  remark: string;
  username: string;

  constructor(userEntity: SysUserEntity) {
    this.avatar = userEntity.avatar;
    this.email = userEntity.email;
    this.gender = userEntity.gender;
    this.mobile = userEntity.mobile;
    this.nickname = userEntity.nickname;
    this.remark = userEntity.remark;
    this.username = userEntity.username;
  }
}

export class UserAvatarGenerateRespDto {
  avatarUrl: string;

  constructor(url: string) {
    this.avatarUrl = url;
  }
}
