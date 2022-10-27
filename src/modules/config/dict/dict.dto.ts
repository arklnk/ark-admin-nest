import { NumberField, StringField } from '/@/decorators/field.decorator';

export class ConfigDictAddReqDto {
  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  name: string;

  @NumberField({
    int: true,
    min: 0,
    required: false,
  })
  orderNum: number;

  @NumberField({
    int: true,
    min: 0,
  })
  parentId: number;

  @StringField({
    required: false,
  })
  remark: string;

  @NumberField({
    int: true,
    min: 0,
    max: 1,
  })
  status: number;

  @NumberField({
    int: true,
    min: 1,
    max: 12,
  })
  type: number;

  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  uniqueKey: string;

  @StringField()
  value: string;
}
