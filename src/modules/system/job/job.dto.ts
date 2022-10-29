import { NumberField, StringField } from '/@/decorators/field.decorator';

export class SysJobAddReqDto {
  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  name: string;

  @NumberField({
    required: false,
    min: 0,
  })
  orderNum?: number;

  @NumberField({
    min: 0,
    max: 1,
  })
  status: number;
}

export class SysJobDeleteReqDto {
  @NumberField({
    min: 1,
  })
  id: number;
}
