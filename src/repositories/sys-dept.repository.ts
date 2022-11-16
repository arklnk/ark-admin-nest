import { uniq } from 'lodash';
import { Repository } from 'typeorm';
import { SysDeptEntity } from '/@/entities/sys-dept.entity';

export interface SysDeptRepository extends Repository<SysDeptEntity> {
  /**
   * 查找当前父级的所有子级部门编号，返回列表不包括父级
   */
  findAllSubDeptIds(
    this: Repository<SysDeptEntity>,
    parentId: number,
  ): Promise<number[]>;
}

export const extendsSysDeptRepository: Pick<
  SysDeptRepository,
  'findAllSubDeptIds'
> = {
  async findAllSubDeptIds(parentId: number): Promise<number[]> {
    const allDeptIds: number[] = [];
    let lastQueryIds: number[] = [parentId];

    do {
      const deptIds = await this.createQueryBuilder('dept')
        .select(['dept.id'])
        .where('FIND_IN_SET(parent_id, :ids)', {
          ids: lastQueryIds.join(','),
        })
        .getMany();

      lastQueryIds = deptIds.map((e) => e.id);
      allDeptIds.push(...lastQueryIds);
    } while (lastQueryIds.length > 0);

    return uniq(allDeptIds);
  },
};
