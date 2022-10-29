import { NumberField, StringField } from '/@/decorators/field.decorator';
import { SysProfessionEntity } from '/@/entities/sys-profession.entity';

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

export class SysProfessionDeleteReqDto {
  @NumberField({
    min: 1,
  })
  id: number;
}

//--------------------------------------------------------------------------------
//------------------------------------- resp -------------------------------------
//--------------------------------------------------------------------------------

export class SysProfessionItemRespDto {
  id: number;
  name: string;
  orderNum: number;
  status: number;

  constructor(entity: SysProfessionEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.orderNum = entity.orderNum;
    this.status = entity.status;
  }
}
