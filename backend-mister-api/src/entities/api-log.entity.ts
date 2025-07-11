import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ApiKey } from './api-key.entity';

@Entity('api_logs')
export class ApiLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  api_key_id?: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ type: 'text', nullable: false })
  table_name: string;

  @Column({ type: 'text', nullable: false })
  endpoint: string;

  @Column({ type: 'text', nullable: false })
  method: string;

  @Column({ type: 'integer', nullable: false })
  status_code: number;

  @Column({ type: 'integer', nullable: false })
  response_time: number;

  @Column({ type: 'text', nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'jsonb', nullable: true })
  request_data?: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => ApiKey, apiKey => apiKey.apiLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'api_key_id' })
  apiKey?: ApiKey;

  @ManyToOne(() => User, user => user.apiLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
} 