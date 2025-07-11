import { IsEmail, IsString, IsNotEmpty, MinLength, IsDateString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mot de passe de l\'utilisateur',
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mot de passe (minimum 8 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre)',
    example: 'Password123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  })
  password: string;

  @ApiProperty({
    description: 'Nom de famille de l\'utilisateur',
    example: 'Dupont'
  })
  @IsString()
  @MaxLength(50)
  nom: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'Jean'
  })
  @IsString()
  @MaxLength(50)
  prenom: string;

  @ApiPropertyOptional({
    description: 'Date de naissance de l\'utilisateur',
    example: '1990-01-01'
  })
  @IsOptional()
  @IsDateString()
  date_naissance?: string;

  @ApiPropertyOptional({
    description: 'Adresse postale de l\'utilisateur',
    example: '123 Rue de la Paix'
  })
  @IsOptional()
  @IsString()
  adresse_postale?: string;

  @ApiPropertyOptional({
    description: 'Code postal de l\'utilisateur',
    example: '75001'
  })
  @IsOptional()
  @IsString()
  code_postal?: string;

  @ApiPropertyOptional({
    description: 'Ville de l\'utilisateur',
    example: 'Paris'
  })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({
    description: 'Pays de l\'utilisateur',
    example: 'France'
  })
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone de l\'utilisateur',
    example: '+33123456789'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Le numéro de téléphone doit être au format international'
  })
  telephone?: string;

  @ApiProperty({
    description: 'Acceptation de la politique de confidentialité (obligatoire)',
    example: true
  })
  @IsNotEmpty()
  politique_confidentialite_acceptee: boolean;

  @ApiProperty({
    description: 'Acceptation des conditions générales d\'utilisation (obligatoire)',
    example: true
  })
  @IsNotEmpty()
  conditions_generales_acceptees: boolean;

  @ApiPropertyOptional({
    description: 'Rôle de l\'utilisateur (user, admin, premium)',
    example: 'user',
    default: 'user'
  })
  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Prénom de l\'utilisateur',
    example: 'Jean'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille de l\'utilisateur',
    example: 'Dupont'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone de l\'utilisateur',
    example: '+33123456789'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Le numéro de téléphone doit être au format international'
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL de l\'avatar de l\'utilisateur',
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiPropertyOptional({
    description: 'Pays de l\'utilisateur',
    example: 'France'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Ville de l\'utilisateur',
    example: 'Paris'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Bio de l\'utilisateur',
    example: 'Développeur passionné par les APIs'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Ancien mot de passe',
    example: 'OldPassword123!'
  })
  @IsString()
  current_password: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (minimum 8 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre)',
    example: 'NewPassword123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  })
  new_password: string;
}

export class UpdateLegalAcceptanceDto {
  @ApiProperty({
    description: 'Acceptation des conditions générales',
    example: true
  })
  @IsNotEmpty()
  conditionsAccepted: boolean;

  @ApiProperty({
    description: 'Acceptation de la politique de confidentialité',
    example: true
  })
  @IsNotEmpty()
  politiqueAccepted: boolean;
} 