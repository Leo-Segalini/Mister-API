import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';

export enum ApiKeyType {
  FREE = 'free',
  PREMIUM = 'premium'
}

export enum TableName {
  PUNCHLINES = 'punchlines',
  PAYS_DU_MONDE = 'pays_du_monde',
  ANIMAUX = 'animaux'
}

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Nom de la clé API',
    example: 'Mon API Key pour Punchlines'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Table associée à cette clé API',
    enum: TableName,
    example: TableName.PUNCHLINES
  })
  @IsEnum(TableName)
  table_name: TableName;

  @ApiPropertyOptional({
    description: 'Type de clé API (sera automatiquement défini selon le statut premium de l\'utilisateur)',
    enum: ApiKeyType,
    example: ApiKeyType.FREE,
    default: ApiKeyType.FREE
  })
  @IsOptional()
  @IsEnum(ApiKeyType)
  type?: ApiKeyType = ApiKeyType.FREE;

  @ApiPropertyOptional({
    description: 'Limite de quota (requêtes par jour) - optionnel, défini automatiquement selon le type',
    example: 1000,
    minimum: 1,
    maximum: 1000000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000000)
  quota_limit?: number;
}

export class UpdateApiKeyDto {
  @ApiPropertyOptional({
    description: 'Nom de la clé API'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type de clé API',
    enum: ApiKeyType
  })
  @IsOptional()
  @IsEnum(ApiKeyType)
  type?: ApiKeyType;

  @ApiPropertyOptional({
    description: 'Limite de quota (requêtes par jour)',
    minimum: 1,
    maximum: 1000000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000000)
  quota_limit?: number;

  @ApiPropertyOptional({
    description: 'Statut actif de la clé API'
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ApiKeyQueryDto {
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
    description: 'Filtrer par table',
    enum: TableName
  })
  @IsOptional()
  @IsEnum(TableName)
  table_name?: TableName;

  @ApiPropertyOptional({
    description: 'Filtrer par type de clé API',
    enum: ApiKeyType
  })
  @IsOptional()
  @IsEnum(ApiKeyType)
  type?: ApiKeyType;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Recherche par nom',
    example: 'punchline'
  })
  @IsOptional()
  @IsString()
  search?: string;
} 