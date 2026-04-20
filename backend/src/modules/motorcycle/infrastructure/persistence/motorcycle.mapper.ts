import { Motorcycle } from '../../domain/entities/motorcycle.entity';
import { MotorcycleTypeEnum } from '../../domain/enums/motorcycle-type.enum';
import { MotorcycleOrmEntity } from './motorcycle.orm-entity';

export class MotorcycleMapper {
  static toDomain(orm: MotorcycleOrmEntity): Motorcycle {
    return new Motorcycle({
      id: orm.id,
      userId: orm.userId,
      name: orm.name,
      brand: orm.brand,
      model: orm.model,
      year: orm.year,
      type: orm.type as MotorcycleTypeEnum,
      currentHours: Number(orm.currentHours),
      imageUrl: orm.imageUrl ?? undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Motorcycle): MotorcycleOrmEntity {
    const orm = new MotorcycleOrmEntity();
    orm.id = domain.getId();
    orm.userId = domain.getUserId();
    orm.name = domain.getName();
    orm.brand = domain.getBrand();
    orm.model = domain.getModel();
    orm.year = domain.getYear();
    orm.type = domain.getType();
    orm.currentHours = domain.getCurrentHours();
    orm.imageUrl = domain.getImageUrl();
    return orm;
  }
}
