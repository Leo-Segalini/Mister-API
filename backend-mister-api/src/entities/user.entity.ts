import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiKey } from './api-key.entity';
import { ApiLog } from './api-log.entity';
import { Payment } from './payment.entity';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string; // Référence vers auth.users

  @Column({ type: 'text', nullable: false })
  nom: string;

  @Column({ type: 'text', nullable: false })
  prenom: string;

  @Column({ type: 'text', unique: true, nullable: false })
  email: string;

  @Column({ type: 'date', nullable: false })
  date_naissance: Date;

  @Column({ type: 'text', nullable: false })
  adresse_postale: string;

  @Column({ type: 'text', nullable: false })
  code_postal: string;

  @Column({ type: 'text', nullable: false })
  ville: string;

  @Column({ type: 'text', nullable: false })
  pays: string;

  @Column({ type: 'text', nullable: true })
  telephone?: string;

  @Column({ type: 'boolean', default: false })
  is_premium: boolean;

  @Column({ type: 'timestamp', nullable: true })
  premium_expires_at?: Date;

  @Column({ type: 'text', nullable: true })
  stripe_customer_id?: string;

  @Column({ type: 'text', default: 'user' })
  role: string;

  // Colonnes légales
  @Column({ type: 'boolean', default: false })
  conditions_generales_acceptees: boolean;

  @Column({ type: 'timestamp', nullable: true })
  date_acceptation_conditions?: Date;

  @Column({ type: 'boolean', default: false })
  politique_confidentialite_acceptee: boolean;

  @Column({ type: 'timestamp', nullable: true })
  date_acceptation_politique?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => ApiKey, apiKey => apiKey.user)
  apiKeys: ApiKey[];

  @OneToMany(() => ApiLog, apiLog => apiLog.user)
  apiLogs: ApiLog[];

  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];
} 