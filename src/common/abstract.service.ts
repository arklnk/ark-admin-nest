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
  protected getTableName(target: any): string {
    // typeorm will check target and throw error
    const meta = this.dataSource.getMetadata(target);
    return meta.tableName;
  }
}
