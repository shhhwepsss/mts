import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('google_providers')
export class GoogleProviderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'google_user_id', unique: true })
  googleUserId: string;

  @Column({ name: 'google_email' })
  googleEmail: string;

  @Column({ name: 'google_avatar_url', nullable: true })
  googleAvatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
