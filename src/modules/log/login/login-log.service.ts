import { Injectable } from '@nestjs/common';
import { LoginLogRespItemDto } from './login-log.dto';
import { AbstractService } from '/@/common/abstract.service';
import { SysLogTypeEnum } from '/@/constants/type';
import { SysLogEntity } from '/@/entities/sys-log.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';

@Injectable()
export class LoginLogService extends AbstractService {
  async getLoginLogByPage(page: number, limit: number) {
    const query = this.entityManager
      .createQueryBuilder(SysLogEntity, 'log')
      .innerJoinAndSelect(SysUserEntity, 'user', 'user.id = log.userId')
      .where('log.type = :type', { type: SysLogTypeEnum.Login })
      .select([
        'user.account AS account',
        'log.id AS id',
        'log.ip AS ip',
        'log.uri AS uri',
        'log.status AS status',
        'log.createTime AS createTime',
      ])
      .skip((page - 1) * limit)
      .limit(limit);

    const rows = await query.getRawMany<LoginLogRespItemDto>();
    const total = await query.getCount();

    return rows.toPage({
      page,
      limit,
      total,
    });
  }
}
