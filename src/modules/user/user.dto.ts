import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CreateLoginCaptchaDto {
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  width?: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  height?: number;
}
