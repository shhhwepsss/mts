import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('maintenance_tasks')
export class MaintenanceTaskOrmEntity {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'motorcycle_id', type: 'uuid' }) motorcycleId: string;
  @Column() name: string;
  @Column({ nullable: true }) description: string | null;
  @Column({ name: 'interval_hours', type: 'decimal', precision: 10, scale: 1 })
  intervalHours: number;
  @Column({
    name: 'last_serviced_at_hours',
    type: 'decimal',
    precision: 10,
    scale: 1,
    nullable: true,
  })
  lastServicedAtHours: number | null;
  @Column({ name: 'is_default' }) isDefault: boolean;
  @Column({ name: 'is_active' }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
