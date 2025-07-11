import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

interface Ville {
  nom: string;
  population: number;
}

interface Region {
  nom: string;
  population: number;
}

@Entity('pays_du_monde')
export class Pays {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  nom: string;

  @Column({ type: 'text', nullable: false })
  capitale: string;

  @Column({ type: 'bigint', nullable: false })
  population: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  superficie: number;

  @Column({ type: 'text', nullable: false })
  continent: string;

  @Column({ type: 'text', nullable: false })
  langue_officielle: string;

  @Column({ type: 'text', nullable: false })
  monnaie: string;

  @Column({ type: 'text', nullable: true })
  drapeau_url?: string;

  @Column({ type: 'bigint', nullable: false })
  nombre_habitants: number;

  @Column({ type: 'jsonb', default: [] })
  plus_grandes_villes: Ville[];

  @Column({ type: 'jsonb', default: [] })
  plus_grandes_regions: Region[];

  @Column({ type: 'text', nullable: true })
  animal_national?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 