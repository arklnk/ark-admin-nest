import { NumberField } from '/@/decorators/field.decorator';

export class CreateLoginCaptchaDto {
  @NumberField({
    required: false,
  })
  width?: number;

  @NumberField({
    required: false,
  })
  height?: number;
}
