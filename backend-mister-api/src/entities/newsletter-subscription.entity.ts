import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum NewsletterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  UNSUBSCRIBED = 'unsubscribed'
}

@Entity('newsletter_subscriptions')
export class NewsletterSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'text', nullable: false, unique: true })
  email: string;

  @Column({ type: 'text', nullable: false })
  nom: string;

  @Column({ type: 'text', nullable: true })
  prenom?: string;

  @Column({ 
    type: 'enum', 
    enum: NewsletterStatus, 
    default: NewsletterStatus.PENDING 
  })
  status: NewsletterStatus;

  @Column({ type: 'text', nullable: true })
  token_confirmation?: string;

  @Column({ type: 'text', nullable: true })
  token_desabonnement?: string;

  @Column({ type: 'timestamp', nullable: true })
  date_confirmation?: Date;

  @Column({ type: 'timestamp', nullable: true })
  date_desabonnement?: Date;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  source?: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
} 