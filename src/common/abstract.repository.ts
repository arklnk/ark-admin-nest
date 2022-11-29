import { Repository } from 'typeorm';

/**
 * Abstract Entity
 */
export abstract class AbstractRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}
}
