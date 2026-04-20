import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('maintenance_records')
export class MaintenanceRecordOrmEntity {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'task_id', type: 'uuid' }) taskId: string;
  @Column({ name: 'motorcycle_id', type: 'uuid' }) motorcycleId: string;
  @Column({
    name: 'performed_at_hours',
    type: 'decimal',
    precision: 10,
    scale: 1,
  })
  performedAtHours: number;
  @Column({ name: 'performed_at_date', type: 'date' }) performedAtDate: Date;
  @Column({ nullable: true }) notes: string | null;
  @Column({ type: 'simple-array', nullable: true }) photos: string[] | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
