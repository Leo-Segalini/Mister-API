import { IsString, IsOptional, IsArray, IsEnum, IsUUID, IsDateString, IsNumber, Min, Max, IsBoolean } from 'class-validator';

export enum PunchlineTheme {
  PHILOSOPHIE = 'Philosophie',
  POLITIQUE = 'Politique',
  LEADERSHIP = 'Leadership',
  SAGESSE = 'Sagesse',
  LITTERATURE = 'Littérature',
  HISTOIRE = 'Histoire',
  SCIENCE = 'Science',
  ART = 'Art',
  AUTRE = 'Autre'
}

export enum PunchlineLangue {
  FRANCE = 'France',
  GRECE = 'Grèce',
  ETATS_UNIS = 'États-Unis',
  ANGLETERRE = 'Angleterre',
  ALLEMAGNE = 'Allemagne',
  ITALIE = 'Italie',
  ESPAGNE = 'Espagne',
  AFRIQUE_DU_SUD = 'Afrique du Sud',
  INDE = 'Inde',
  CHINE = 'Chine',
  JAPON = 'Japon',
  AUTRE = 'Autre'
}

export class CreatePunchlineDto {
  @IsString()
  citation: string;

  @IsString()
  auteur: string;

  @IsEnum(PunchlineTheme)
  theme: PunchlineTheme;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  source_film?: boolean;

  @IsOptional()
  @IsBoolean()
  source_livre?: boolean;

  @IsNumber()
  annee: number;

  @IsEnum(PunchlineLangue)
  langue: PunchlineLangue;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  popularite?: number;
}

export class UpdatePunchlineDto {
  @IsOptional()
  @IsString()
  citation?: string;

  @IsOptional()
  @IsString()
  auteur?: string;

  @IsOptional()
  @IsEnum(PunchlineTheme)
  theme?: PunchlineTheme;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  source_film?: boolean;

  @IsOptional()
  @IsBoolean()
  source_livre?: boolean;

  @IsOptional()
  @IsNumber()
  annee?: number;

  @IsOptional()
  @IsEnum(PunchlineLangue)
  langue?: PunchlineLangue;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  popularite?: number;
}

export class PunchlineQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PunchlineTheme)
  theme?: PunchlineTheme;

  @IsOptional()
  @IsEnum(PunchlineLangue)
  langue?: PunchlineLangue;

  @IsOptional()
  @IsString()
  auteur?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsNumber()
  annee?: number;

  @IsOptional()
  @IsString()
  annee_range?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  popularite_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  sortBy?: string = 'popularite';
} 