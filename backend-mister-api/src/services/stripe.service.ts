import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { ApiKey } from '../entities/api-key.entity';
import { NotificationService } from './notification.service';

export interface CreateCheckoutSessionDto {
  userId: string;
  priceId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionDto {
  userId: string;
  priceId: string;
  paymentMethodId: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly premiumPriceId: string;
  private readonly premiumProductId: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly notificationService: NotificationService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-06-30.basil',
    });
    
    // Prix premium par défaut (5€/mois)
    this.premiumPriceId = this.configService.get('STRIPE_PREMIUM_PRICE_ID', 'price_1OqX9w2dgIFG');
    
    // ID du produit premium
    this.premiumProductId = this.configService.get('STRIPE_PREMIUM_PRODUCT_ID', 'prod_Sda9wzmw1dgIFG');
  }

  /**
   * Crée une session de paiement pour l'upgrade premium
   */
  async createCheckoutSession(data: CreateCheckoutSessionDto): Promise<Stripe.Checkout.Session> {
    try {
      const user = await this.userRepository.findOne({ where: { id: data.userId } });
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: data.priceId || this.premiumPriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        customer_email: user.email || undefined,
        metadata: {
          userId: data.userId,
          ...data.metadata,
        },
        subscription_data: {
          metadata: {
            userId: data.userId,
          },
        },
      });

      this.logger.log(`Session de paiement créée pour l'utilisateur ${data.userId}: ${session.id}`);
      return session;
    } catch (error) {
      this.logger.error('Erreur lors de la création de la session de paiement:', error);
      throw error;
    }
  }

  /**
   * Crée un abonnement directement
   */
  async createSubscription(data: CreateSubscriptionDto): Promise<Stripe.Subscription> {
    try {
      const user = await this.userRepository.findOne({ where: { id: data.userId } });
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Créer ou récupérer le client Stripe
      let customer: Stripe.Customer;
      const existingCustomers = await this.stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await this.stripe.customers.create({
          email: user.email,
          metadata: {
            userId: data.userId,
          },
        });
      }

      // Attacher la méthode de paiement au client
      await this.stripe.paymentMethods.attach(data.paymentMethodId, {
        customer: customer.id,
      });

      // Créer l'abonnement
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: data.priceId || this.premiumPriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: data.userId,
        },
      });

      this.logger.log(`Abonnement créé pour l'utilisateur ${data.userId}: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error('Erreur lors de la création de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      this.logger.log(`Abonnement ${subscriptionId} marqué pour annulation`);
      return subscription;
    } catch (error) {
      this.logger.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Récupère les abonnements d'un utilisateur
   */
  async getUserSubscriptions(userId: string): Promise<Stripe.Subscription[]> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const subscriptions = await this.stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      return subscriptions.data;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des abonnements:', error);
      throw error;
    }
  }

  /**
   * Met à jour un abonnement
   */
  async updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });

      this.logger.log(`Abonnement ${subscriptionId} mis à jour vers ${priceId}`);
      return updatedSubscription;
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Crée une session pour le portail client Stripe
   */
  async createCustomerPortalSession(userId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.stripe_customer_id) {
        throw new Error('Utilisateur ou client Stripe non trouvé');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: returnUrl,
      });

      this.logger.log(`Session portail client créée pour l'utilisateur ${userId}`);
      return session;
    } catch (error) {
      this.logger.error('Erreur lors de la création de la session portail client:', error);
      throw error;
    }
  }

  /**
   * Gère les webhooks Stripe
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          this.logger.log(`Webhook non géré: ${event.type}`);
      }
    } catch (error) {
      this.logger.error('Erreur lors du traitement du webhook:', error);
      throw error;
    }
  }

  /**
   * Gère la finalisation d'une session de paiement
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const userId = session.metadata?.userId;
      if (!userId) {
        this.logger.warn('Session sans userId dans les métadonnées');
        return;
      }

      // Récupérer les détails du paiement
      const paymentIntent = session.payment_intent as string;
      const amount = session.amount_total || 0;
      const currency = session.currency?.toUpperCase() || 'EUR';

      // Créer un enregistrement dans la table payments
      const payment = this.paymentRepository.create({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent,
        stripe_customer_id: session.customer as string,
        amount: amount,
        currency: currency,
        status: PaymentStatus.SUCCEEDED,
        payment_method: 'stripe',
        description: `Paiement Premium - Session ${session.id}`,
        metadata: {
          session_id: session.id,
          price_id: session.line_items?.data[0]?.price?.id,
          mode: session.mode,
          success_url: session.success_url,
          cancel_url: session.cancel_url,
        },
      });

      await this.paymentRepository.save(payment);

      // Mettre à jour l'utilisateur
      await this.userRepository.update(userId, {
        is_premium: true,
        stripe_customer_id: session.customer as string,
        premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      });

      // Envoyer notification de bienvenue
      await this.notificationService.sendWelcomeSubscriptionNotification({
        email: session.customer_details?.email || '',
        nom: session.customer_details?.name || '',
        prenom: '',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        renewalLink: '/dashboard'
      });

      this.logger.log(`Abonnement activé pour l'utilisateur ${userId} - Paiement enregistré: ${payment.id}`);
    } catch (error) {
      this.logger.error('Erreur lors du traitement de la session complétée:', error);
    }
  }

  /**
   * Gère le succès d'un paiement d'invoice
   */
  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    try {
      // Vérifier si l'invoice a une subscription
      const subscriptionId = invoice.subscription;
      if (!subscriptionId) {
        this.logger.warn('Invoice sans subscription');
        return;
      }

      // Récupérer la subscription complète
      const subscription = await this.stripe.subscriptions.retrieve(
        typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id
      );

      const userId = subscription.metadata?.userId;
      
      if (!userId) {
        this.logger.warn('Invoice sans userId dans les métadonnées');
        return;
      }

      // Créer un enregistrement dans la table payments pour le renouvellement
      const payment = this.paymentRepository.create({
        user_id: userId,
        stripe_payment_intent_id: invoice.payment_intent as string,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: invoice.customer as string,
        amount: invoice.amount_paid,
        currency: invoice.currency?.toUpperCase() || 'EUR',
        status: PaymentStatus.SUCCEEDED,
        payment_method: 'stripe',
        description: `Renouvellement Premium - Invoice ${invoice.id}`,
        metadata: {
          invoice_id: invoice.id,
          subscription_id: subscriptionId,
          period_start: new Date(invoice.period_start * 1000).toISOString(),
          period_end: new Date(invoice.period_end * 1000).toISOString(),
          is_renewal: true,
        },
      });

      await this.paymentRepository.save(payment);

      // Mettre à jour l'utilisateur
      await this.userRepository.update(userId, {
        is_premium: true,
        premium_expires_at: new Date((subscription as any).current_period_end * 1000),
      });

      // Envoyer notification de renouvellement
      await this.notificationService.sendSubscriptionRenewalNotification({
        email: invoice.customer_email || '',
        nom: '',
        prenom: '',
        expirationDate: new Date((subscription as any).current_period_end * 1000).toLocaleDateString('fr-FR'),
        renewalLink: '/dashboard'
      });

      this.logger.log(`Paiement réussi pour l'utilisateur ${userId} - Renouvellement enregistré: ${payment.id}`);
    } catch (error) {
      this.logger.error('Erreur lors du traitement du paiement réussi:', error);
    }
  }

  /**
   * Gère l'échec d'un paiement d'invoice
   */
  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    try {
      // Vérifier si l'invoice a une subscription
      const subscriptionId = invoice.subscription;
      if (!subscriptionId) {
        this.logger.warn('Invoice sans subscription');
        return;
      }

      // Récupérer la subscription complète
      const subscription = await this.stripe.subscriptions.retrieve(
        typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id
      );

      const userId = subscription.metadata?.userId;
      
      if (!userId) {
        this.logger.warn('Invoice sans userId dans les métadonnées');
        return;
      }

      // Marquer l'abonnement comme expiré
      await this.userRepository.update(userId, {
        is_premium: false,
      });

      this.logger.log(`Paiement échoué pour l'utilisateur ${userId}`);
    } catch (error) {
      this.logger.error('Erreur lors du traitement du paiement échoué:', error);
    }
  }

  /**
   * Gère la mise à jour d'un abonnement
   */
  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    try {
      const userId = subscription.metadata?.userId;
      if (!userId) {
        this.logger.warn('Subscription sans userId dans les métadonnées');
        return;
      }

      const isActive = subscription.status === 'active';
      
      await this.userRepository.update(userId, {
        is_premium: isActive,
        premium_expires_at: isActive ? new Date((subscription as any).current_period_end * 1000) : undefined,
      });

      this.logger.log(`Abonnement mis à jour pour l'utilisateur ${userId}: ${subscription.status}`);
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour de l\'abonnement:', error);
    }
  }

  /**
   * Gère la suppression d'un abonnement
   */
  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    try {
      const userId = subscription.metadata?.userId;
      if (!userId) {
        this.logger.warn('Subscription sans userId dans les métadonnées');
        return;
      }

      await this.userRepository.update(userId, {
        is_premium: false,
        premium_expires_at: undefined,
      });

      this.logger.log(`Abonnement supprimé pour l'utilisateur ${userId}`);
    } catch (error) {
      this.logger.error('Erreur lors de la suppression de l\'abonnement:', error);
    }
  }

  /**
   * Récupère les prix disponibles (filtré pour le produit premium)
   */
  async getPrices(): Promise<Stripe.Price[]> {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });

      // Filtrer pour ne garder que le produit premium
      const filteredPrices = prices.data.filter((price) => {
        // Vérifier que le produit existe et correspond à notre produit premium
        if (typeof price.product === 'object' && price.product) {
          return price.product.id === this.premiumProductId;
        }
        return false;
      });

      this.logger.log(`Prix filtrés: ${filteredPrices.length} prix trouvés pour le produit premium (${this.premiumProductId})`);
      return filteredPrices;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des prix:', error);
      throw error;
    }
  }

  /**
   * Crée un remboursement
   */
  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = amount;
      }

      const refund = await this.stripe.refunds.create(refundData);
      this.logger.log(`Remboursement créé: ${refund.id}`);
      return refund;
    } catch (error) {
      this.logger.error('Erreur lors de la création du remboursement:', error);
      throw error;
    }
  }

  /**
   * Vérifie la signature du webhook
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is required');
      }

      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Erreur lors de la vérification de la signature:', error);
      throw error;
    }
  }

  /**
   * Récupère le prix premium par défaut
   */
  getPremiumPriceId(): string {
    return this.premiumPriceId;
  }
} 