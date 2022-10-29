import { NumberField, StringField } from '/@/decorators/field.decorator';
import { SysJobEntity } from '/@/entities/sys-job.entity';

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

export class SysJobUpdateReqDto extends SysJobAddReqDto {
  @NumberField({
    min: 1,
  })
  id: number;
}

export class SysJobDeleteReqDto {
  @NumberField({
    min: 1,
  })
  id: number;
}

//--------------------------------------------------------------------------------
//------------------------------------- resp -------------------------------------
//--------------------------------------------------------------------------------

export class SysJobItemRespDto {
  id: number;
  name: string;
  orderNum: number;
  status: number;

  constructor(entity: SysJobEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.orderNum = entity.orderNum;
    this.status = entity.status;
  }
}
