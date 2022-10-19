import type { EntityTarget } from 'typeorm';

import { InjectDataSource, InjectEntityManager } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

export abstract class AbstractService {
  @InjectDataSource()
  private _dataSource: DataSource;

  @InjectEntityManager()
  private _entityManager: EntityManager;

  protected get dataSource() {
    return this._dataSource;
  }

  protected get entityManager() {
    return this._entityManager;
  }

  /**
   * Executes raw SQL query and returns raw database results
   */
  protected async nativeQuery<T = any>(
    sql: string,
    parameters?: any[],
  ): Promise<T> {
    return await this.entityManager.query(sql, parameters);
  }

  /**
   * Get entity table name in the database
   */
  protected getTableName(target: EntityTarget<any>): string {
    const tableName = this.dataSource.getMetadata(target).tableName;

    if (!tableName) {
      throw new Error('target is not marked as entity class');
    }

    return tableName;
  }
}
