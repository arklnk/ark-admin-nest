import { NumberField, StringField } from '/@/decorators/field.decorator';

export class SysProfessionAddReqDto {
  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  name: string;

  @NumberField({
    min: 0,
  })
  orderNum: number;

  @NumberField({
    min: 0,
    max: 1,
  })
  status: number;
}
