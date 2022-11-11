import { ApiProperty } from '@nestjs/swagger';
import { NumberField } from '/@/decorators/field.decorator';

export class PageOptionsDto {
  @NumberField({
    min: 1,
  })
  @ApiProperty()
  page: number;

  @NumberField({
    min: 1,
  })
  @ApiProperty()
  limit: number;
}
