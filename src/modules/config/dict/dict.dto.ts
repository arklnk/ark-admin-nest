import { OmitType } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { PageOptionsDto } from '/@/common/dtos/page-options.dto';
import { TREE_ROOT_NODE_ID } from '/@/constants/core';
import { NumberField, StringField } from '/@/decorators/field.decorator';
import { SysDictionaryEntity } from '/@/entities/sys-dictionary.entity';

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
  orderNum?: number;

  @NumberField({
    int: true,
    min: 0,
  })
  parentId: number;

  @StringField({
    required: false,
  })
  remark?: string;

  @NumberField({
    int: true,
    min: 0,
    max: 1,
  })
  @ValidateIf((o) => o.parentId !== TREE_ROOT_NODE_ID)
  status: number;

  @NumberField({
    int: true,
    min: 1,
    max: 12,
  })
  @ValidateIf((o) => o.parentId !== TREE_ROOT_NODE_ID)
  type: number;

  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  uniqueKey: string;

  @StringField({ required: false })
  value?: string;
}

export class ConfigDictDataPageReqDto extends PageOptionsDto {
  @NumberField({
    int: true,
    min: 1,
  })
  parentId: number;
}

export class ConfigDictIdDto {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
}

export class ConfigDictUpdateReqDto extends OmitType(ConfigDictAddReqDto, [
  'uniqueKey',
] as const) {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
}

//--------------------------------------------------------------------------------
//------------------------------------- resp -------------------------------------
//--------------------------------------------------------------------------------

export class ConfigDictRespItemDto {
  id: number;
  name: string;
  orderNum: number;
  parentId: number;
  remark: string;
  status: number;
  type: number;
  uniqueKey: string;
  value: string;

  constructor(entity: SysDictionaryEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.orderNum = entity.orderNum;
    this.parentId = entity.parentId;
    this.remark = entity.remark;
    this.status = entity.status;
    this.type = entity.type;
    this.uniqueKey = entity.uniqueKey;
    this.value = entity.value;
  }
}
