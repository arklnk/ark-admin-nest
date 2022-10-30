import { NumberField, StringField } from '/@/decorators/field.decorator';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';

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
    int: true,
    required: false,
  })
  orderNum?: number;

  @NumberField({
    min: 0,
    int: true,
  })
  parentId: number;

  @StringField({
    required: false,
  })
  remark?: string;

  @NumberField({
    min: 0,
    max: 1,
    int: true,
  })
  status: number;

  @NumberField({
    min: 1,
    max: 3,
    int: true,
  })
  type: number;

  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  uniqueKey: string;
}

export class SysDeptDeleteReqDto {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
}

export class SysDeptItemRespDto {
  fullName: string;
  id: number;
  name: string;
  orderNum: number;
  parentId: number;
  remark: string;
  status: number;
  type: number;
  uniqueKey: string;

  constructor(entity: SysDeptEntity) {
    this.fullName = entity.fullName;
    this.id = entity.id;
    this.name = entity.name;
    this.orderNum = entity.orderNum;
    this.parentId = entity.parentId;
    this.remark = entity.remark;
    this.status = entity.status;
    this.type = entity.type;
    this.uniqueKey = entity.uniqueKey;
  }
}
