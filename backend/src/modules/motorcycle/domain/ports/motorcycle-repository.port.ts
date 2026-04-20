import { Motorcycle } from '../entities/motorcycle.entity';

export const MOTORCYCLE_REPOSITORY = Symbol('MOTORCYCLE_REPOSITORY');

export interface MotorcycleRepositoryPort {
  findById(id: string): Promise<Motorcycle | null>;
  findByUserId(userId: string): Promise<Motorcycle[]>;
  save(motorcycle: Motorcycle): Promise<Motorcycle>;
  delete(id: string): Promise<void>;
}
