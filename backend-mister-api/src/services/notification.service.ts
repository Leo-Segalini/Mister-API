import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoConfigService } from './brevo-config.service';

export interface SecurityAlert {
  type: 'suspicious_activity' | 'quota_exceeded' | 'key_compromised' | 'rotation_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context: any;
  timestamp: Date;
}

export interface UserNotification {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

export interface SystemNotification {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  details?: any;
}

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface SubscriptionExpirationData {
  email: string;
  nom: string;
  prenom?: string;
  expirationDate: string;
  renewalLink: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly brevoConfigService: BrevoConfigService,
  ) {}

  /**
   * Envoie une alerte de sécurité
   */
  async sendSecurityAlert(alert: SecurityAlert): Promise<void> {
    this.logger.warn(`Alerte de sécurité [${alert.severity.toUpperCase()}]: ${alert.message}`, alert.context);

    // Ici vous pourriez intégrer différents services de notification :
    // - Email (SendGrid, AWS SES, etc.)
    // - Slack/Discord webhooks
    // - SMS (Twilio, etc.)
    // - Push notifications
    // - Webhooks personnalisés

    switch (alert.severity) {
      case 'critical':
        await this.sendCriticalAlert(alert);
        break;
      case 'high':
        await this.sendHighPriorityAlert(alert);
        break;
      case 'medium':
        await this.sendMediumPriorityAlert(alert);
        break;
      case 'low':
        await this.sendLowPriorityAlert(alert);
        break;
    }
  }

  /**
   * Envoie une alerte critique (immédiate)
   */
  private async sendCriticalAlert(alert: SecurityAlert): Promise<void> {
    // Alerte critique - notification immédiate
    this.logger.error(`ALERTE CRITIQUE: ${alert.message}`, {
      type: alert.type,
      context: alert.context,
      timestamp: alert.timestamp,
    });

    // Exemple d'intégration avec un service externe
    // await this.sendEmail({
    //   to: this.configService.get('SECURITY_EMAIL'),
    //   subject: `[CRITIQUE] Alerte de sécurité - ${alert.type}`,
    //   body: this.formatAlertEmail(alert),
    //   priority: 'high'
    // });

    // await this.sendSlackMessage({
    //   channel: '#security-alerts',
    //   text: `🚨 ALERTE CRITIQUE: ${alert.message}`,
    //   attachments: [this.formatSlackAttachment(alert)]
    // });
  }

  /**
   * Envoie une alerte haute priorité
   */
  private async sendHighPriorityAlert(alert: SecurityAlert): Promise<void> {
    this.logger.warn(`ALERTE HAUTE PRIORITÉ: ${alert.message}`, {
      type: alert.type,
      context: alert.context,
      timestamp: alert.timestamp,
    });

    // Notification dans les 30 minutes
    // await this.scheduleNotification(alert, 30 * 60 * 1000);
  }

  /**
   * Envoie une alerte moyenne priorité
   */
  private async sendMediumPriorityAlert(alert: SecurityAlert): Promise<void> {
    this.logger.warn(`ALERTE MOYENNE PRIORITÉ: ${alert.message}`, {
      type: alert.type,
      context: alert.context,
      timestamp: alert.timestamp,
    });

    // Notification dans les 2 heures
    // await this.scheduleNotification(alert, 2 * 60 * 60 * 1000);
  }

  /**
   * Envoie une alerte basse priorité
   */
  private async sendLowPriorityAlert(alert: SecurityAlert): Promise<void> {
    this.logger.log(`ALERTE BASSE PRIORITÉ: ${alert.message}`, {
      type: alert.type,
      context: alert.context,
      timestamp: alert.timestamp,
    });

    // Notification dans les 24 heures
    // await this.scheduleNotification(alert, 24 * 60 * 60 * 1000);
  }

  /**
   * Envoie un rapport de sécurité hebdomadaire
   */
  async sendWeeklySecurityReport(report: any): Promise<void> {
    this.logger.log('Envoi du rapport de sécurité hebdomadaire', report);

    // Exemple d'envoi de rapport par email
    // await this.sendEmail({
    //   to: this.configService.get('ADMIN_EMAIL'),
    //   subject: 'Rapport de sécurité hebdomadaire',
    //   body: this.formatWeeklyReport(report),
    //   attachments: [this.generateReportAttachment(report)]
    // });
  }

  /**
   * Notifie un utilisateur de la désactivation de sa clé API
   */
  async notifyApiKeyDeactivation(userId: string, apiKeyId: string, reason: string): Promise<void> {
    this.logger.warn(`Clé API ${apiKeyId} désactivée pour l'utilisateur ${userId}: ${reason}`);

    // Exemple d'envoi de notification à l'utilisateur
    // await this.sendEmail({
    //   to: user.email,
    //   subject: 'Votre clé API a été désactivée',
    //   body: this.formatDeactivationEmail(apiKeyId, reason)
    // });
  }

  /**
   * Notifie un utilisateur de la rotation de sa clé API
   */
  async notifyApiKeyRotation(userId: string, oldKeyId: string, newKeyId: string): Promise<void> {
    this.logger.log(`Clé API ${oldKeyId} renouvelée pour l'utilisateur ${userId}, nouvelle clé: ${newKeyId}`);

    // Exemple d'envoi de notification à l'utilisateur
    // await this.sendEmail({
    //   to: user.email,
    //   subject: 'Votre clé API a été renouvelée',
    //   body: this.formatRotationEmail(oldKeyId, newKeyId)
    // });
  }

  /**
   * Formate un email d'alerte
   */
  private formatAlertEmail(alert: SecurityAlert): string {
    return `
      <h2>Alerte de sécurité - ${alert.type.toUpperCase()}</h2>
      <p><strong>Sévérité:</strong> ${alert.severity.toUpperCase()}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Date:</strong> ${alert.timestamp.toISOString()}</p>
      <h3>Contexte:</h3>
      <pre>${JSON.stringify(alert.context, null, 2)}</pre>
    `;
  }

  /**
   * Formate un rapport hebdomadaire
   */
  private formatWeeklyReport(report: any): string {
    return `
      <h2>Rapport de sécurité hebdomadaire</h2>
      <p><strong>Période:</strong> ${report.period}</p>
      <p><strong>Score de sécurité:</strong> ${report.securityScore}/100</p>
      <h3>Statistiques:</h3>
      <ul>
        <li>Total des clés API: ${report.totalKeys}</li>
        <li>Clés actives: ${report.activeKeys}</li>
        <li>Clés désactivées: ${report.deactivatedKeys}</li>
        <li>Appels API totaux: ${report.totalApiCalls}</li>
        <li>Activités suspectes: ${report.suspiciousActivities}</li>
      </ul>
      <h3>Recommandations:</h3>
      <ul>
        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    `;
  }

  /**
   * Formate un email de désactivation
   */
  private formatDeactivationEmail(apiKeyId: string, reason: string): string {
    return `
      <h2>Votre clé API a été désactivée</h2>
      <p><strong>Clé API:</strong> ${apiKeyId}</p>
      <p><strong>Raison:</strong> ${reason}</p>
      <p>Pour plus d'informations, veuillez contacter le support.</p>
    `;
  }

  /**
   * Formate un email de rotation
   */
  private formatRotationEmail(oldKeyId: string, newKeyId: string): string {
    return `
      <h2>Votre clé API a été renouvelée</h2>
      <p><strong>Ancienne clé:</strong> ${oldKeyId}</p>
      <p><strong>Nouvelle clé:</strong> ${newKeyId}</p>
      <p>Veuillez mettre à jour vos applications avec la nouvelle clé API.</p>
    `;
  }

  /**
   * Envoie une notification à un utilisateur
   */
  async sendNotification(notification: UserNotification): Promise<void> {
    this.logger.log(`Notification envoyée à l'utilisateur ${notification.userId}: ${notification.title}`);

    // Ici vous pourriez intégrer différents services de notification :
    // - Email
    // - Push notifications
    // - SMS
    // - Notifications in-app

    switch (notification.priority) {
      case 'high':
        await this.sendHighPriorityUserNotification(notification);
        break;
      case 'medium':
        await this.sendMediumPriorityUserNotification(notification);
        break;
      case 'low':
        await this.sendLowPriorityUserNotification(notification);
        break;
    }
  }

  /**
   * Envoie une notification système
   */
  async sendSystemNotification(notification: SystemNotification): Promise<void> {
    this.logger.log(`Notification système: ${notification.title}`);

    // Ici vous pourriez intégrer différents services de notification :
    // - Email aux administrateurs
    // - Slack/Discord webhooks
    // - Dashboard d'administration

    switch (notification.priority) {
      case 'high':
        await this.sendHighPrioritySystemNotification(notification);
        break;
      case 'medium':
        await this.sendMediumPrioritySystemNotification(notification);
        break;
      case 'low':
        await this.sendLowPrioritySystemNotification(notification);
        break;
    }
  }

  /**
   * Envoie une notification utilisateur haute priorité
   */
  private async sendHighPriorityUserNotification(notification: UserNotification): Promise<void> {
    this.logger.warn(`NOTIFICATION UTILISATEUR HAUTE PRIORITÉ: ${notification.title}`, {
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      data: notification.data,
    });

    // Notification immédiate
    // await this.sendEmail({
    //   to: user.email,
    //   subject: notification.title,
    //   body: notification.message,
    //   priority: 'high'
    // });
  }

  /**
   * Envoie une notification utilisateur moyenne priorité
   */
  private async sendMediumPriorityUserNotification(notification: UserNotification): Promise<void> {
    this.logger.log(`NOTIFICATION UTILISATEUR MOYENNE PRIORITÉ: ${notification.title}`, {
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      data: notification.data,
    });

    // Notification dans les 2 heures
    // await this.scheduleUserNotification(notification, 2 * 60 * 60 * 1000);
  }

  /**
   * Envoie une notification utilisateur basse priorité
   */
  private async sendLowPriorityUserNotification(notification: UserNotification): Promise<void> {
    this.logger.log(`NOTIFICATION UTILISATEUR BASSE PRIORITÉ: ${notification.title}`, {
      userId: notification.userId,
      type: notification.type,
      message: notification.message,
      data: notification.data,
    });

    // Notification dans les 24 heures
    // await this.scheduleUserNotification(notification, 24 * 60 * 60 * 1000);
  }

  /**
   * Envoie une notification système haute priorité
   */
  private async sendHighPrioritySystemNotification(notification: SystemNotification): Promise<void> {
    this.logger.error(`NOTIFICATION SYSTÈME HAUTE PRIORITÉ: ${notification.title}`, {
      type: notification.type,
      message: notification.message,
      details: notification.details,
    });

    // Notification immédiate aux administrateurs
    // await this.sendEmail({
    //   to: this.configService.get('ADMIN_EMAIL'),
    //   subject: `[URGENT] ${notification.title}`,
    //   body: notification.message,
    //   priority: 'high'
    // });
  }

  /**
   * Envoie une notification système moyenne priorité
   */
  private async sendMediumPrioritySystemNotification(notification: SystemNotification): Promise<void> {
    this.logger.warn(`NOTIFICATION SYSTÈME MOYENNE PRIORITÉ: ${notification.title}`, {
      type: notification.type,
      message: notification.message,
      details: notification.details,
    });

    // Notification dans les 2 heures
    // await this.scheduleSystemNotification(notification, 2 * 60 * 60 * 1000);
  }

  /**
   * Envoie une notification système basse priorité
   */
  private async sendLowPrioritySystemNotification(notification: SystemNotification): Promise<void> {
    this.logger.log(`NOTIFICATION SYSTÈME BASSE PRIORITÉ: ${notification.title}`, {
      type: notification.type,
      message: notification.message,
      details: notification.details,
    });

    // Notification dans les 24 heures
    // await this.scheduleSystemNotification(notification, 24 * 60 * 60 * 1000);
  }

  /**
   * Envoie un email via Brevo
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      this.logger.log(`📧 Envoi d'email à ${emailData.to} avec le template ${emailData.template}`);
      
      const result = await this.brevoConfigService.sendTransactionalEmail({
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
        data: emailData.data,
      });

      this.logger.log(`✅ Email envoyé avec succès à ${emailData.to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi d'email à ${emailData.to}:`, error);
      return false;
    }
  }

  /**
   * Envoie une notification d'expiration d'abonnement
   */
  async sendSubscriptionExpirationNotification(data: SubscriptionExpirationData): Promise<boolean> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    
    return this.sendEmail({
      to: data.email,
      subject: 'Votre abonnement premium a expiré',
      template: 'subscription-expired',
      data: {
        name: `${data.prenom || ''} ${data.nom}`.trim(),
        email: data.email,
        expirationDate: data.expirationDate,
        renewalLink: `${frontendUrl}/pricing`,
        supportEmail: 'support@votreapi.com',
      },
    });
  }

  /**
   * Envoie une notification de renouvellement d'abonnement
   */
  async sendSubscriptionRenewalNotification(data: SubscriptionExpirationData): Promise<boolean> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    
    return this.sendEmail({
      to: data.email,
      subject: 'Votre abonnement premium a été renouvelé',
      template: 'subscription-renewed',
      data: {
        name: `${data.prenom || ''} ${data.nom}`.trim(),
        email: data.email,
        renewalDate: new Date().toLocaleDateString('fr-FR'),
        dashboardLink: `${frontendUrl}/dashboard`,
        supportEmail: 'support@votreapi.com',
      },
    });
  }

  /**
   * Envoie une notification de bienvenue pour un nouvel abonnement
   */
  async sendWelcomeSubscriptionNotification(data: SubscriptionExpirationData): Promise<boolean> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    
    return this.sendEmail({
      to: data.email,
      subject: 'Bienvenue dans votre abonnement premium !',
      template: 'subscription-welcome',
      data: {
        name: `${data.prenom || ''} ${data.nom}`.trim(),
        email: data.email,
        dashboardLink: `${frontendUrl}/dashboard`,
        apiDocsLink: `${frontendUrl}/docs`,
        supportEmail: 'support@votreapi.com',
      },
    });
  }

  /**
   * Envoie une notification de confirmation de newsletter
   */
  async sendNewsletterConfirmation(email: string, nom: string, token: string): Promise<boolean> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    
    return this.sendEmail({
      to: email,
      subject: 'Confirmez votre abonnement à la newsletter',
      template: 'newsletter-confirmation',
      data: {
        name: nom,
        email: email,
        confirmationLink: `${frontendUrl}/newsletter/confirm?token=${token}`,
        unsubscribeLink: `${frontendUrl}/newsletter/unsubscribe?token=${token}`,
      },
    });
  }

  /**
   * Envoie une notification de désabonnement newsletter
   */
  async sendNewsletterUnsubscribeConfirmation(email: string, nom: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Vous êtes désabonné de la newsletter',
      template: 'newsletter-unsubscribed',
      data: {
        name: nom,
        email: email,
        resubscribeLink: `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/newsletter`,
      },
    });
  }

  /**
   * Envoie une newsletter à tous les abonnés actifs
   */
  async sendNewsletterToSubscribers(
    subject: string,
    content: string,
    subscribers: Array<{ email: string; nom: string; prenom?: string }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      const sent = await this.sendEmail({
        to: subscriber.email,
        subject: subject,
        template: 'newsletter-content',
        data: {
          name: `${subscriber.prenom || ''} ${subscriber.nom}`.trim(),
          email: subscriber.email,
          content: content,
          unsubscribeLink: `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/newsletter/unsubscribe`,
        },
      });

      if (sent) {
        success++;
      } else {
        failed++;
      }
    }

    this.logger.log(`📧 Newsletter envoyée: ${success} succès, ${failed} échecs`);
    return { success, failed };
  }
} 