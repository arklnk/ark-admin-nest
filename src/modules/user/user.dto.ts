import { NumberField, StringField } from '/@/decorators/field.decorator';

export class UserLoginCaptchaDto {
  @NumberField({
    required: false,
  })
  width?: number;

  @NumberField({
    required: false,
  })
  height?: number;
}

export class UserLoginDto {
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
