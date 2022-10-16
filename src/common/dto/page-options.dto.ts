import { NumberField } from '/@/decorators/field.decorator';

export class PageOptionsDto {
  @NumberField({
    min: 1,
  })
  page: number;

  @NumberField({
    min: 1,
  })
  limit: number;
}
