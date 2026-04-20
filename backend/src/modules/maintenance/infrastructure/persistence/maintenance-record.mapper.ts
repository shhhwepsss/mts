import { MaintenanceRecord } from '../../domain/entities/maintenance-record.entity';
import { MaintenanceRecordOrmEntity } from './maintenance-record.orm-entity';

export class MaintenanceRecordMapper {
  static toDomain(
    orm: MaintenanceRecordOrmEntity,
    currentMotorcycleHours: number = Infinity,
  ): MaintenanceRecord {
    return new MaintenanceRecord({
      id: orm.id,
      taskId: orm.taskId,
      motorcycleId: orm.motorcycleId,
      performedAtHours: Number(orm.performedAtHours),
      performedAtDate: new Date(orm.performedAtDate),
      currentMotorcycleHours,
      notes: orm.notes ?? undefined,
      photos: orm.photos ?? undefined,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: MaintenanceRecord): MaintenanceRecordOrmEntity {
    const orm = new MaintenanceRecordOrmEntity();
    orm.id = domain.getId();
    orm.taskId = domain.getTaskId();
    orm.motorcycleId = domain.getMotorcycleId();
    orm.performedAtHours = domain.getPerformedAtHours();
    orm.performedAtDate = domain.getPerformedAtDate();
    orm.notes = domain.getNotes();
    orm.photos = domain.getPhotos().length > 0 ? domain.getPhotos() : null;
    return orm;
  }
}
