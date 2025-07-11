import { IsString, IsOptional, IsArray, IsNumber, Min, Max, IsBoolean, IsEnum } from 'class-validator';

export enum AnimalType {
  MAMMIFERE = 'mammifere',
  OISEAU = 'oiseau',
  REPTILE = 'reptile',
  AMPHIBIEN = 'amphibien',
  POISSON = 'poisson',
  INSECTE = 'insecte',
  AUTRE = 'autre'
}

export enum ConservationStatus {
  EXTINCT = 'extinct',
  EXTINCT_WILD = 'extinct_wild',
  CRITICALLY_ENDANGERED = 'critically_endangered',
  ENDANGERED = 'endangered',
  VULNERABLE = 'vulnerable',
  NEAR_THREATENED = 'near_threatened',
  LEAST_CONCERN = 'least_concern',
  DATA_DEFICIENT = 'data_deficient'
}

export class CreateAnimalDto {
  @IsString()
  nom: string;

  @IsString()
  espece: string;

  @IsString()
  famille: string;

  @IsString()
  habitat: string;

  @IsString()
  alimentation: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taille?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poids?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  esperance_vie?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  zones_geographiques?: string[];

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAnimalDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  espece?: string;

  @IsOptional()
  @IsString()
  famille?: string;

  @IsOptional()
  @IsString()
  habitat?: string;

  @IsOptional()
  @IsString()
  alimentation?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taille?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poids?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  esperance_vie?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  zones_geographiques?: string[];

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class AnimalQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  famille?: string;

  @IsOptional()
  @IsString()
  habitat?: string;

  @IsOptional()
  @IsString()
  alimentation?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taille_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taille_max?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poids_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poids_max?: number;

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
  order?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  sortBy?: string = 'nom';
} 