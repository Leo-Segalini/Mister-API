import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ApiLog } from './api-log.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  api_key: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  table_name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, default: 'free' })
  type: 'free' | 'premium';

  @Column({ type: 'integer', default: 0 })
  appels_jour: number;

  @Column({ type: 'integer', default: 60 })
  appels_minute: number;

  @Column({ type: 'integer', default: 0, comment: 'Quota horaire - 0 = illimité' })
  quota_horaire: number;

  @Column({ type: 'integer', default: 0, comment: 'Quota mensuel - 0 = illimité' })
  quota_mensuel: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_used_at?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ApiLog, apiLog => apiLog.apiKey)
  apiLogs: ApiLog[];
} 