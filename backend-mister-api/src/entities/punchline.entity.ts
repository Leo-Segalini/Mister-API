import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('punchlines')
export class Punchline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  citation: string;

  @Column({ type: 'text', nullable: false })
  auteur: string;

  @Column({ type: 'text', nullable: false })
  theme: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'boolean', nullable: false, default: false })
  source_film: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  source_livre: boolean;

  @Column({ type: 'integer', nullable: false })
  annee: number;

  @Column({ type: 'text', nullable: false })
  langue: string; // Origine géographique (France, Angleterre, États-Unis, etc.)

  @Column({ type: 'integer', nullable: false, default: 0 })
  popularite: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 