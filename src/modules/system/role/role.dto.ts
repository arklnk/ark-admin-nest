import { NumberField, StringField } from '/@/decorators/field.decorator';
import { SysRoleEntity } from '/@/entities/sys-role.entity';

export class SysRoleDeleteReqDto {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
}

export class SysRoleAddReqDto {
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
  orderNum?: number;

  @NumberField({
    int: true,
    min: 0,
  })
  parentId: number;

  @NumberField({
    each: true,
    int: true,
  })
  permMenuIds: number[];

  @StringField({
    required: false,
  })
  remark?: string;

  @NumberField({
    int: true,
    min: 0,
    max: 1,
  })
  status: number;

  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  uniqueKey: string;
}

export class SysRoleListItemRespDto {
  id: number;
  name: string;
  orderNum: number;
  parentId: number;
  permMenuIds: number[];
  remark: string;
  status: number;
  uniqueKey: string;

  constructor(entity: SysRoleEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.orderNum = entity.orderNum;
    this.parentId = entity.parentId;
    this.permMenuIds = entity.permMenuIds;
    this.remark = entity.remark;
    this.status = entity.status;
    this.uniqueKey = entity.uniqueKey;
  }
}
