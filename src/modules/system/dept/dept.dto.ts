import { NumberField, StringField } from '/@/decorators/field.decorator';

export class SysDeptAddReqDto {
  @StringField({
    minLength: 2,
    maxLength: 50,
    required: false,
  })
  fullName?: string;

  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  name: string;

  @NumberField({
    min: 0,
    required: false,
  })
  orderNum?: number;

  @NumberField({
    min: 0,
  })
  parentId: number;

  @StringField({
    required: false,
  })
  remark?: string;

  @NumberField({
    min: 0,
    max: 1,
  })
  status: number;

  @NumberField({
    min: 1,
    max: 3,
  })
  type: number;

  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  uniqueKey: string;
}
