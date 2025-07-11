import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, Min, Max, IsBoolean } from 'class-validator';

interface Ville {
  nom: string;
  population: number;
}

interface Region {
  nom: string;
  population: number;
}

export class CreatePaysDuMondeDto {
  @ApiProperty({
    description: 'Nom du pays',
    example: 'France'
  })
  @IsString()
  nom: string;

  @ApiProperty({
    description: 'Capitale du pays',
    example: 'Paris'
  })
  @IsString()
  capitale: string;

  @ApiProperty({
    description: 'Population du pays',
    example: 67390000
  })
  @IsNumber()
  @Min(0)
  population: number;

  @ApiProperty({
    description: 'Superficie du pays en km²',
    example: 551695
  })
  @IsNumber()
  @Min(0)
  superficie: number;

  @ApiProperty({
    description: 'Continent du pays',
    example: 'Europe'
  })
  @IsString()
  continent: string;

  @ApiProperty({
    description: 'Langue officielle du pays',
    example: 'Français'
  })
  @IsString()
  langue_officielle: string;

  @ApiProperty({
    description: 'Monnaie du pays',
    example: 'Euro'
  })
  @IsString()
  monnaie: string;

  @ApiProperty({
    description: 'Nombre d\'habitants du pays',
    example: 67390000
  })
  @IsNumber()
  @Min(0)
  nombre_habitants: number;

  @ApiPropertyOptional({
    description: 'Plus grandes villes du pays',
    example: [
      { nom: 'Paris', population: 2161000 },
      { nom: 'Marseille', population: 861635 }
    ],
    type: 'array'
  })
  @IsOptional()
  @IsArray()
  plus_grandes_villes?: Ville[];

  @ApiPropertyOptional({
    description: 'Plus grandes régions du pays',
    example: [
      { nom: 'Île-de-France', population: 12278247 }
    ],
    type: 'array'
  })
  @IsOptional()
  @IsArray()
  plus_grandes_regions?: Region[];

  @ApiPropertyOptional({
    description: 'Animal national du pays',
    example: 'Coq gaulois'
  })
  @IsOptional()
  @IsString()
  animal_national?: string;

  @ApiPropertyOptional({
    description: 'Indicateur si le pays est actif',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePaysDuMondeDto {
  @ApiPropertyOptional({
    description: 'Nom du pays'
  })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional({
    description: 'Capitale du pays'
  })
  @IsOptional()
  @IsString()
  capitale?: string;

  @ApiPropertyOptional({
    description: 'Population du pays'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  population?: number;

  @ApiPropertyOptional({
    description: 'Superficie du pays en km²'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  superficie?: number;

  @ApiPropertyOptional({
    description: 'Continent du pays'
  })
  @IsOptional()
  @IsString()
  continent?: string;

  @ApiPropertyOptional({
    description: 'Langue officielle du pays'
  })
  @IsOptional()
  @IsString()
  langue_officielle?: string;

  @ApiPropertyOptional({
    description: 'Monnaie du pays'
  })
  @IsOptional()
  @IsString()
  monnaie?: string;

  @ApiPropertyOptional({
    description: 'Nombre d\'habitants du pays'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  nombre_habitants?: number;

  @ApiPropertyOptional({
    description: 'Plus grandes villes du pays',
    type: 'array'
  })
  @IsOptional()
  @IsArray()
  plus_grandes_villes?: Ville[];

  @ApiPropertyOptional({
    description: 'Plus grandes régions du pays',
    type: 'array'
  })
  @IsOptional()
  @IsArray()
  plus_grandes_regions?: Region[];

  @ApiPropertyOptional({
    description: 'Animal national du pays'
  })
  @IsOptional()
  @IsString()
  animal_national?: string;

  @ApiPropertyOptional({
    description: 'Indicateur si le pays est actif'
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class PaysDuMondeQueryDto {
  @ApiPropertyOptional({
    description: 'Recherche par nom de pays',
    example: 'fran'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par continent',
    example: 'Europe'
  })
  @IsOptional()
  @IsString()
  continent?: string;

  @ApiPropertyOptional({
    description: 'Population minimum',
    example: 10000000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  population_min?: number;

  @ApiPropertyOptional({
    description: 'Population maximum',
    example: 100000000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  population_max?: number;

  @ApiPropertyOptional({
    description: 'Superficie minimum en km²',
    example: 100000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  superficie_min?: number;

  @ApiPropertyOptional({
    description: 'Superficie maximum en km²',
    example: 1000000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  superficie_max?: number;

  @ApiPropertyOptional({
    description: 'Filtrer les pays actifs',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Ordre de tri (asc/desc)',
    example: 'asc'
  })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'nom'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'nom';
} 