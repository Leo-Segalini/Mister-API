import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('animaux')
export class Animal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  nom: string;

  @Column({ type: 'text', nullable: false })
  espece: string;

  @Column({ type: 'text', nullable: false })
  famille: string;

  @Column({ type: 'text', nullable: false })
  habitat: string;

  @Column({ type: 'text', nullable: false })
  alimentation: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  taille?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  poids?: number;

  @Column({ type: 'integer', nullable: true })
  esperance_vie?: number;

  @Column({ type: 'text', array: true, default: [] })
  zones_geographiques: string[];

  @Column({ type: 'text', nullable: true })
  image_url?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 