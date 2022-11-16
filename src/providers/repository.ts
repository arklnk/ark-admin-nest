import { Provider } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';
import { SysUserEntity } from '/@/entities/sys-user.entity';
import { extendsSysDeptRepository } from '/@/repositories/sys-dept.repository';
import { extendsSysUserRepository } from '/@/repositories/sys-user.repository';

export const SysUserRepositoryProvider: Provider = {
  provide: getRepositoryToken(SysUserEntity),
  inject: [getDataSourceToken()],
  useFactory: (datasource: DataSource) => {
    return datasource
      .getRepository(SysUserEntity)
      .extend(extendsSysUserRepository);
  },
};

export const SysDeptRepositoryProvider: Provider = {
  provide: getRepositoryToken(SysDeptEntity),
  inject: [getDataSourceToken()],
  useFactory: (datasrouce: DataSource) => {
    return datasrouce
      .getRepository(SysDeptEntity)
      .extend(extendsSysDeptRepository);
  },
};
