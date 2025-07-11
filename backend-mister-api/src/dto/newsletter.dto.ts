import { IsEmail, IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NewsletterStatus } from '../entities/newsletter-subscription.entity';

export class CreateNewsletterSubscriptionDto {
  @ApiProperty({ description: 'Adresse email de l\'abonné' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nom de famille de l\'abonné' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Prénom de l\'abonné (optionnel)' })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ description: 'Préférences de contenu', required: false })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;

  @ApiProperty({ description: 'Source de l\'abonnement', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateNewsletterSubscriptionDto {
  @ApiProperty({ description: 'Nom de famille de l\'abonné' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ description: 'Prénom de l\'abonné' })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ description: 'Statut de l\'abonnement' })
  @IsOptional()
  @IsEnum(NewsletterStatus)
  status?: NewsletterStatus;

  @ApiProperty({ description: 'Préférences de contenu' })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;

  @ApiProperty({ description: 'Source de l\'abonnement' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class NewsletterQueryDto {
  @ApiProperty({ description: 'Numéro de page', required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Nombre d\'éléments par page', required: false })
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Recherche par email ou nom', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filtrer par statut', required: false })
  @IsOptional()
  @IsEnum(NewsletterStatus)
  status?: NewsletterStatus;

  @ApiProperty({ description: 'Filtrer par source', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

export class ConfirmNewsletterDto {
  @ApiProperty({ description: 'Token de confirmation' })
  @IsString()
  token: string;
}

export class UnsubscribeNewsletterDto {
  @ApiProperty({ description: 'Token de désabonnement' })
  @IsString()
  token: string;
} 