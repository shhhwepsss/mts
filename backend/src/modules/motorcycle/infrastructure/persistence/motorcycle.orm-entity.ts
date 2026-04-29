import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('motorcycles')
export class MotorcycleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  brand: string;

  @Column({ length: 255 })
  model: string;

  @Column()
  year: number;

  @Column({ length: 50 })
  type: string;

  @Column({ name: 'current_hours', type: 'decimal', precision: 10, scale: 1 })
  currentHours: number;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
