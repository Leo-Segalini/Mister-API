import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { NotificationService } from './notification.service';

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookConfigs: Map<string, WebhookConfig> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {
    this.initializeWebhookConfigs();
  }

  /**
   * Initialise les configurations de webhooks
   */
  private initializeWebhookConfigs(): void {
    // Configuration pour les événements de paiement
    const paymentUrl = this.configService.get('WEBHOOK_PAYMENT_URL');
    if (paymentUrl) {
      this.webhookConfigs.set('payment_events', {
        url: paymentUrl,
        events: [
          'payment.succeeded',
          'payment.failed',
          'subscription.created',
          'subscription.updated',
          'subscription.deleted',
        ],
        secret: this.configService.get('WEBHOOK_PAYMENT_SECRET'),
      });
    }

    // Configuration pour les événements de sécurité
    const securityUrl = this.configService.get('WEBHOOK_SECURITY_URL');
    if (securityUrl) {
      this.webhookConfigs.set('security_events', {
        url: securityUrl,
        events: [
          'api_key.rotated',
          'api_key.suspicious_activity',
          'user.login_failed',
          'user.account_locked',
        ],
        secret: this.configService.get('WEBHOOK_SECURITY_SECRET'),
      });
    }

    // Configuration pour les événements d'administration
    const adminUrl = this.configService.get('WEBHOOK_ADMIN_URL');
    if (adminUrl) {
      this.webhookConfigs.set('admin_events', {
        url: adminUrl,
        events: [
          'user.created',
          'user.updated',
          'user.deleted',
          'quota.exceeded',
          'system.alert',
        ],
        secret: this.configService.get('WEBHOOK_ADMIN_SECRET'),
      });
    }
  }

  /**
   * Envoie un webhook
   */
  async sendWebhook(configKey: string, event: WebhookEvent): Promise<boolean> {
    try {
      const config = this.webhookConfigs.get(configKey);
      if (!config || !config.url) {
        this.logger.warn(`Configuration webhook non trouvée ou URL manquante: ${configKey}`);
        return false;
      }

      // Vérifier si l'événement est configuré pour ce webhook
      if (!config.events.includes(event.type)) {
        this.logger.debug(`Événement ${event.type} non configuré pour le webhook ${configKey}`);
        return false;
      }

      const payload = {
        event: event.type,
        data: event.data,
        timestamp: event.timestamp.toISOString(),
        source: event.source,
        id: event.id,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Punchiline-API-Webhook/1.0',
        ...config.headers,
      };

      // Ajouter la signature si un secret est configuré
      if (config.secret) {
        const signature = this.generateSignature(JSON.stringify(payload), config.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.error(`Erreur webhook ${configKey}: ${response.status} ${response.statusText}`);
        return false;
      }

      this.logger.log(`Webhook ${configKey} envoyé avec succès pour l'événement ${event.type}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du webhook ${configKey}:`, error);
      return false;
    }
  }

  /**
   * Génère une signature pour sécuriser les webhooks
   */
  private generateSignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Traite un événement de paiement
   */
  async handlePaymentEvent(event: WebhookEvent): Promise<void> {
    try {
      // Envoyer le webhook
      await this.sendWebhook('payment_events', event);

      // Traiter l'événement localement
      switch (event.type) {
        case 'payment.succeeded':
          await this.handlePaymentSucceeded(event.data);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(event.data);
          break;
        case 'subscription.created':
          await this.handleSubscriptionCreated(event.data);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(event.data);
          break;
        case 'subscription.deleted':
          await this.handleSubscriptionDeleted(event.data);
          break;
      }
    } catch (error) {
      this.logger.error('Erreur lors du traitement de l\'événement de paiement:', error);
    }
  }

  /**
   * Traite un événement de sécurité
   */
  async handleSecurityEvent(event: WebhookEvent): Promise<void> {
    try {
      // Envoyer le webhook
      await this.sendWebhook('security_events', event);

      // Traiter l'événement localement
      switch (event.type) {
        case 'api_key.rotated':
          await this.handleApiKeyRotated(event.data);
          break;
        case 'api_key.suspicious_activity':
          await this.handleSuspiciousActivity(event.data);
          break;
        case 'user.login_failed':
          await this.handleLoginFailed(event.data);
          break;
        case 'user.account_locked':
          await this.handleAccountLocked(event.data);
          break;
      }
    } catch (error) {
      this.logger.error('Erreur lors du traitement de l\'événement de sécurité:', error);
    }
  }

  /**
   * Traite un événement d'administration
   */
  async handleAdminEvent(event: WebhookEvent): Promise<void> {
    try {
      // Envoyer le webhook
      await this.sendWebhook('admin_events', event);

      // Traiter l'événement localement
      switch (event.type) {
        case 'user.created':
          await this.handleUserCreated(event.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(event.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(event.data);
          break;
        case 'quota.exceeded':
          await this.handleQuotaExceeded(event.data);
          break;
        case 'system.alert':
          await this.handleSystemAlert(event.data);
          break;
      }
    } catch (error) {
      this.logger.error('Erreur lors du traitement de l\'événement d\'administration:', error);
    }
  }

  /**
   * Gère un paiement réussi
   */
  private async handlePaymentSucceeded(data: any): Promise<void> {
    const { userId, amount, currency } = data;
    
    // Mettre à jour le statut de l'utilisateur
    await this.userRepository.update(userId, {
      is_premium: true,
    });

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'payment_success',
      title: 'Paiement réussi',
      message: `Votre paiement de ${amount} ${currency} a été traité avec succès.`,
      priority: 'high',
    });

    this.logger.log(`Paiement réussi pour l'utilisateur ${userId}`);
  }

  /**
   * Gère un paiement échoué
   */
  private async handlePaymentFailed(data: any): Promise<void> {
    const { userId, amount, currency, reason } = data;

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'payment_failed',
      title: 'Paiement échoué',
      message: `Votre paiement de ${amount} ${currency} a échoué: ${reason}`,
      priority: 'high',
    });

    this.logger.warn(`Paiement échoué pour l'utilisateur ${userId}: ${reason}`);
  }

  /**
   * Gère la création d'un abonnement
   */
  private async handleSubscriptionCreated(data: any): Promise<void> {
    const { userId, subscriptionId, plan } = data;

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'subscription_created',
      title: 'Abonnement créé',
      message: `Votre abonnement ${plan} a été créé avec succès.`,
      priority: 'high',
    });

    this.logger.log(`Abonnement créé pour l'utilisateur ${userId}: ${subscriptionId}`);
  }

  /**
   * Gère la mise à jour d'un abonnement
   */
  private async handleSubscriptionUpdated(data: any): Promise<void> {
    const { userId, subscriptionId, changes } = data;

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'subscription_updated',
      title: 'Abonnement mis à jour',
      message: `Votre abonnement a été mis à jour: ${changes.join(', ')}`,
      priority: 'medium',
    });

    this.logger.log(`Abonnement mis à jour pour l'utilisateur ${userId}: ${changes.join(', ')}`);
  }

  /**
   * Gère la suppression d'un abonnement
   */
  private async handleSubscriptionDeleted(data: any): Promise<void> {
    const { userId, subscriptionId } = data;

    // Rétrograder l'utilisateur vers le plan gratuit
    await this.userRepository.update(userId, {
      is_premium: false,
      premium_expires_at: undefined,
    });

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'subscription_cancelled',
      title: 'Abonnement annulé',
      message: 'Votre abonnement premium a été annulé. Vous avez été rétrogradé au plan gratuit.',
      priority: 'high',
    });

    this.logger.log(`Abonnement supprimé pour l'utilisateur ${userId}`);
  }

  /**
   * Gère la rotation d'une clé API
   */
  private async handleApiKeyRotated(data: any): Promise<void> {
    const { userId, keyId, reason } = data;

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'api_key_rotated',
      title: 'Clé API renouvelée',
      message: `Votre clé API a été automatiquement renouvelée: ${reason}`,
      priority: 'medium',
    });

    this.logger.log(`Clé API rotée pour l'utilisateur ${userId}: ${reason}`);
  }

  /**
   * Gère une activité suspecte
   */
  private async handleSuspiciousActivity(data: any): Promise<void> {
    const { userId, keyId, activity, riskLevel } = data;

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'suspicious_activity',
      title: 'Activité suspecte détectée',
      message: `Activité suspecte détectée sur votre clé API: ${activity} (Niveau de risque: ${riskLevel})`,
      priority: 'high',
    });

    this.logger.warn(`Activité suspecte pour l'utilisateur ${userId}: ${activity}`);
  }

  /**
   * Gère un échec de connexion
   */
  private async handleLoginFailed(data: any): Promise<void> {
    const { userId, ip, userAgent, attempts } = data;

    if (attempts >= 5) {
      // Envoyer une notification d'alerte
      await this.notificationService.sendNotification({
        userId,
        type: 'login_failed',
        title: 'Échecs de connexion multiples',
        message: `${attempts} tentatives de connexion échouées depuis ${ip}`,
        priority: 'high',
      });
    }

    this.logger.warn(`Échec de connexion pour l'utilisateur ${userId} depuis ${ip}`);
  }

  /**
   * Gère le verrouillage d'un compte
   */
  private async handleAccountLocked(data: any): Promise<void> {
    const { userId, reason, duration } = data;

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'account_locked',
      title: 'Compte temporairement verrouillé',
      message: `Votre compte a été verrouillé pour ${duration} minutes: ${reason}`,
      priority: 'high',
    });

    this.logger.warn(`Compte verrouillé pour l'utilisateur ${userId}: ${reason}`);
  }

  /**
   * Gère la création d'un utilisateur
   */
  private async handleUserCreated(data: any): Promise<void> {
    const { userId, email } = data;

    // Envoyer une notification de bienvenue
    await this.notificationService.sendNotification({
      userId,
      type: 'welcome',
      title: 'Bienvenue sur Punchiline API',
      message: 'Votre compte a été créé avec succès. Commencez à utiliser notre API !',
      priority: 'medium',
    });

    this.logger.log(`Nouvel utilisateur créé: ${email} (${userId})`);
  }

  /**
   * Gère la mise à jour d'un utilisateur
   */
  private async handleUserUpdated(data: any): Promise<void> {
    const { userId, changes } = data;

    this.logger.log(`Utilisateur mis à jour ${userId}: ${changes.join(', ')}`);
  }

  /**
   * Gère la suppression d'un utilisateur
   */
  private async handleUserDeleted(data: any): Promise<void> {
    const { userId, email } = data;

    this.logger.log(`Utilisateur supprimé: ${email} (${userId})`);
  }

  /**
   * Gère le dépassement de quota
   */
  private async handleQuotaExceeded(data: any): Promise<void> {
    const { userId, quota, usage } = data;

    // Envoyer une notification
    await this.notificationService.sendNotification({
      userId,
      type: 'quota_exceeded',
      title: 'Quota dépassé',
      message: `Vous avez dépassé votre quota (${usage}/${quota}). Passez au plan premium pour plus de requêtes.`,
      priority: 'medium',
    });

    this.logger.warn(`Quota dépassé pour l'utilisateur ${userId}: ${usage}/${quota}`);
  }

  /**
   * Gère une alerte système
   */
  private async handleSystemAlert(data: any): Promise<void> {
    const { level, message, details } = data;

    // Envoyer une notification aux administrateurs
    await this.notificationService.sendSystemNotification({
      type: 'system_alert',
      title: `Alerte système - ${level}`,
      message,
      priority: level === 'critical' ? 'high' : 'medium',
      details,
    });

    this.logger.error(`Alerte système ${level}: ${message}`);
  }

  /**
   * Ajoute une configuration de webhook personnalisée
   */
  addWebhookConfig(key: string, config: WebhookConfig): void {
    this.webhookConfigs.set(key, config);
    this.logger.log(`Configuration webhook ajoutée: ${key}`);
  }

  /**
   * Supprime une configuration de webhook
   */
  removeWebhookConfig(key: string): boolean {
    const removed = this.webhookConfigs.delete(key);
    if (removed) {
      this.logger.log(`Configuration webhook supprimée: ${key}`);
    }
    return removed;
  }

  /**
   * Récupère toutes les configurations de webhooks
   */
  getWebhookConfigs(): Map<string, WebhookConfig> {
    return new Map(this.webhookConfigs);
  }
} 