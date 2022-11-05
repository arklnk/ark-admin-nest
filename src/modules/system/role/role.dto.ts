import { NumberField } from '/@/decorators/field.decorator';
import { SysRoleEntity } from '/@/entities/sys-role.entity';

export class SysRoleDeleteReqDto {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
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
    this.permMenuIds = entity.permmenuIds;
    this.remark = entity.remark;
    this.status = entity.status;
    this.uniqueKey = entity.uniqueKey;
  }
}
