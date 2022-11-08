import { ArrayNotEmpty, ValidateIf } from 'class-validator';
import { SysMenuTypeEnum } from '/@/constants/type';
import { NumberField, StringField } from '/@/decorators/field.decorator';
import { SysPermMenuEntity } from '/@/entities/sys-perm-menu.entity';

export class SysPermMenuDeleteReqDto {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
}

export class SysPermMenuAddReqDto {
  @NumberField({
    int: true,
    min: 0,
    max: 2,
  })
  type: number;

  @StringField({
    required: false,
  })
  icon?: string;

  @NumberField({
    int: true,
    min: 0,
    max: 1,
  })
  @ValidateIf((o) => o.type !== SysMenuTypeEnum.Permission)
  isShow: number;

  @StringField({
    minLength: 2,
    maxLength: 50,
  })
  name: string;

  @NumberField({
    required: false,
  })
  orderNum?: number;

  @NumberField({
    int: true,
    min: 0,
  })
  parentId: number;

  @StringField({
    each: true,
  })
  @ArrayNotEmpty()
  @ValidateIf((o) => o.type === SysMenuTypeEnum.Permission)
  perms: string[];

  @StringField()
  @ValidateIf((o) => o.type !== SysMenuTypeEnum.Permission)
  router: string;

  @StringField()
  @ValidateIf((o) => o.type === SysMenuTypeEnum.Menu)
  viewPath: string;

  @StringField({
    required: false,
  })
  activeRouter?: string;
}

export class SysPermMenuUpdateReqDto extends SysPermMenuAddReqDto {
  @NumberField({
    int: true,
    min: 1,
  })
  id: number;
}

//--------------------------------------------------------------------------------
//------------------------------------- resp -------------------------------------
//--------------------------------------------------------------------------------

export class SysPermMenuItemRespDto {
  activeRouter: string;
  icon: string;
  id: number;
  isShow: number;
  name: string;
  orderNum: number;
  parentId: number;
  perms: string[];
  router: string;
  type: number;
  viewPath: string;
  has: number;

  constructor(entity: SysPermMenuEntity, has: number) {
    this.activeRouter = entity.activeRouter;
    this.icon = entity.icon;
    this.id = entity.id;
    this.isShow = entity.isShow;
    this.name = entity.name;
    this.orderNum = entity.orderNum;
    this.parentId = entity.parentId;
    this.perms = JSON.parse(entity.perms) || [];
    this.router = entity.router;
    this.type = entity.type;
    this.viewPath = entity.viewPath;
    this.has = has;
  }
}
