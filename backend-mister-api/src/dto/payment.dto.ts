import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUrl, IsUUID, IsEnum, IsObject } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class CreateCheckoutSessionDto {
  @ApiPropertyOptional({
    description: 'ID du prix Stripe (optionnel, utilise le prix par défaut si non fourni)',
    example: 'price_1ABC123DEF456',
  })
  @IsOptional()
  @IsString()
  priceId?: string;

  @ApiProperty({
    description: 'URL de redirection en cas de succès',
    example: 'https://example.com/success',
  })
  @IsUrl()
  successUrl: string;

  @ApiProperty({
    description: 'URL de redirection en cas d\'annulation',
    example: 'https://example.com/cancel',
  })
  @IsUrl()
  cancelUrl: string;

  @ApiProperty({
    description: 'Métadonnées supplémentaires',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, string>;
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID du prix Stripe',
    example: 'price_1ABC123DEF456',
  })
  @IsString()
  priceId: string;

  @ApiProperty({
    description: 'ID de la méthode de paiement',
    example: 'pm_1ABC123DEF456',
  })
  @IsString()
  paymentMethodId: string;
}

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'Nouvel ID de prix',
    example: 'price_1ABC123DEF456',
  })
  @IsString()
  priceId: string;
}

export class CancelSubscriptionDto {
  @ApiProperty({
    description: 'ID de l\'abonnement',
    example: 'sub_1ABC123DEF456',
  })
  @IsString()
  subscriptionId: string;
}

export class CreatePortalSessionDto {
  @ApiProperty({
    description: 'URL de retour après utilisation du portail',
    example: 'https://example.com/account',
  })
  @IsUrl()
  returnUrl: string;
}

export class CreateRefundDto {
  @ApiProperty({
    description: 'ID du Payment Intent',
    example: 'pi_1ABC123DEF456',
  })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({
    description: 'Montant du remboursement en centimes (optionnel)',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;
}

export class WebhookEventDto {
  @ApiProperty({
    description: 'Type d\'événement Stripe',
    example: 'checkout.session.completed',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Données de l\'événement',
  })
  data: any;
}

export class PaymentMethodDto {
  @ApiProperty({
    description: 'ID de la méthode de paiement',
    example: 'pm_1ABC123DEF456',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Type de méthode de paiement',
    example: 'card',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Derniers 4 chiffres de la carte',
    example: '4242',
  })
  @IsString()
  last4: string;

  @ApiProperty({
    description: 'Marque de la carte',
    example: 'visa',
  })
  @IsString()
  brand: string;

  @ApiProperty({
    description: 'Mois d\'expiration',
    example: 12,
  })
  @IsNumber()
  expMonth: number;

  @ApiProperty({
    description: 'Année d\'expiration',
    example: 2025,
  })
  @IsNumber()
  expYear: number;
}

export class SubscriptionItemDto {
  @ApiProperty({
    description: 'ID du prix',
    example: 'price_1ABC123DEF456',
  })
  @IsString()
  priceId: string;

  @ApiProperty({
    description: 'Quantité',
    example: 1,
  })
  @IsNumber()
  quantity: number;
}

export class SubscriptionDto {
  @ApiProperty({
    description: 'ID de l\'abonnement',
    example: 'sub_1ABC123DEF456',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Statut de l\'abonnement',
    example: 'active',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Début de la période actuelle',
    example: 1640995200,
  })
  @IsNumber()
  currentPeriodStart: number;

  @ApiProperty({
    description: 'Fin de la période actuelle',
    example: 1643673600,
  })
  @IsNumber()
  currentPeriodEnd: number;

  @ApiProperty({
    description: 'Annulation à la fin de la période',
    example: false,
  })
  cancelAtPeriodEnd: boolean;

  @ApiProperty({
    description: 'Éléments de l\'abonnement',
    type: [SubscriptionItemDto],
  })
  items: SubscriptionItemDto[];
}

export class RecurringDto {
  @ApiProperty({
    description: 'Intervalle de récurrence',
    example: 'month',
  })
  @IsString()
  interval: string;

  @ApiProperty({
    description: 'Nombre d\'intervalles',
    example: 1,
  })
  @IsNumber()
  intervalCount: number;
}

export class ProductDto {
  @ApiProperty({
    description: 'ID du produit',
    example: 'prod_1ABC123DEF456',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Nom du produit',
    example: 'Plan Premium',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description du produit',
    example: 'Accès premium à toutes les fonctionnalités',
  })
  @IsString()
  description: string;
}

export class PriceDto {
  @ApiProperty({
    description: 'ID du prix',
    example: 'price_1ABC123DEF456',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Devise',
    example: 'eur',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Montant unitaire en centimes',
    example: 999,
  })
  @IsNumber()
  unitAmount: number;

  @ApiProperty({
    description: 'Informations de récurrence',
    type: RecurringDto,
  })
  recurring: RecurringDto;

  @ApiProperty({
    description: 'Informations du produit',
    type: ProductDto,
  })
  product: ProductDto;
}

export class RefundDto {
  @ApiProperty({
    description: 'ID du remboursement',
    example: 're_1ABC123DEF456',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Montant remboursé en centimes',
    example: 999,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Statut du remboursement',
    example: 'succeeded',
  })
  @IsString()
  status: string;
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID de l\'utilisateur' })
  @IsUUID()
  user_id: string;

  @ApiPropertyOptional({ description: 'ID du Payment Intent Stripe' })
  @IsOptional()
  @IsString()
  stripe_payment_intent_id?: string;

  @ApiPropertyOptional({ description: 'ID de l\'abonnement Stripe' })
  @IsOptional()
  @IsString()
  stripe_subscription_id?: string;

  @ApiPropertyOptional({ description: 'ID du client Stripe' })
  @IsOptional()
  @IsString()
  stripe_customer_id?: string;

  @ApiProperty({ description: 'Montant en centimes' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Devise', default: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Statut du paiement', enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Méthode de paiement' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Description du paiement' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Métadonnées du paiement' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({ description: 'ID du Payment Intent Stripe' })
  @IsOptional()
  @IsString()
  stripe_payment_intent_id?: string;

  @ApiPropertyOptional({ description: 'ID de l\'abonnement Stripe' })
  @IsOptional()
  @IsString()
  stripe_subscription_id?: string;

  @ApiPropertyOptional({ description: 'ID du client Stripe' })
  @IsOptional()
  @IsString()
  stripe_customer_id?: string;

  @ApiPropertyOptional({ description: 'Montant en centimes' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Devise' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Statut du paiement', enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Méthode de paiement' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Description du paiement' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Métadonnées du paiement' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PaymentResponseDto {
  @ApiProperty({ description: 'ID du paiement' })
  id: string;

  @ApiProperty({ description: 'ID de l\'utilisateur' })
  user_id: string;

  @ApiPropertyOptional({ description: 'ID du Payment Intent Stripe' })
  stripe_payment_intent_id?: string;

  @ApiPropertyOptional({ description: 'ID de l\'abonnement Stripe' })
  stripe_subscription_id?: string;

  @ApiPropertyOptional({ description: 'ID du client Stripe' })
  stripe_customer_id?: string;

  @ApiProperty({ description: 'Montant en centimes' })
  amount: number;

  @ApiProperty({ description: 'Devise' })
  currency: string;

  @ApiProperty({ description: 'Statut du paiement', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiPropertyOptional({ description: 'Méthode de paiement' })
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Description du paiement' })
  description?: string;

  @ApiPropertyOptional({ description: 'Métadonnées du paiement' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Date de création' })
  created_at: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updated_at: Date;
} 