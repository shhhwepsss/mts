import { MaintenanceTask } from '../../domain/entities/maintenance-task.entity';
import { MaintenanceTaskOrmEntity } from './maintenance-task.orm-entity';

export class MaintenanceTaskMapper {
  static toDomain(orm: MaintenanceTaskOrmEntity): MaintenanceTask {
    return new MaintenanceTask({
      id: orm.id,
      motorcycleId: orm.motorcycleId,
      name: orm.name,
      description: orm.description ?? undefined,
      intervalHours: Number(orm.intervalHours),
      lastServicedAtHours: Number(orm.lastServicedAtHours),
      isDefault: orm.isDefault,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: MaintenanceTask): MaintenanceTaskOrmEntity {
    const orm = new MaintenanceTaskOrmEntity();
    orm.id = domain.getId();
    orm.motorcycleId = domain.getMotorcycleId();
    orm.name = domain.getName();
    orm.description = domain.getDescription();
    orm.intervalHours = domain.getIntervalHours();
    orm.lastServicedAtHours = domain.getLastServicedAtHours();
    orm.isDefault = domain.getIsDefault();
    orm.isActive = domain.getIsActive();
    return orm;
  }
}
