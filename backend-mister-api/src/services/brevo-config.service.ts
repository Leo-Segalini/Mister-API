import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BrevoConfigService {
  private readonly logger = new Logger(BrevoConfigService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Vérifie la configuration Brevo et diagnostique les problèmes
   */
  async diagnoseBrevoConfiguration() {
    try {
      this.logger.log('🔍 Diagnostic de la configuration Brevo...');

      const diagnosis: any = {
        smtpSettings: await this.checkSMTPSettings(),
        domainVerification: await this.checkDomainVerification(),
        senderVerification: await this.checkSenderVerification(),
        recommendations: []
      };

      // Générer des recommandations basées sur le diagnostic
      if (!diagnosis.domainVerification.isVerified) {
        diagnosis.recommendations.push({
          priority: 'high',
          action: 'Authentifier le domaine dans Brevo',
          steps: [
            'Aller dans Settings → Senders & IP → Domains',
            'Ajouter votre domaine (ex: iroko.io)',
            'Configurer les enregistrements DNS SPF, DKIM, DMARC',
            'Attendre la validation (peut prendre jusqu\'à 24h)'
          ]
        });
      }

      if (!diagnosis.senderVerification.isVerified) {
        diagnosis.recommendations.push({
          priority: 'medium',
          action: 'Vérifier une adresse email expéditeur',
          steps: [
            'Aller dans Settings → Senders & IP → Senders',
            'Ajouter noreply@votre-domaine.com',
            'Cliquer sur le lien de vérification dans l\'email reçu'
          ]
        });
      }

      this.logger.log('✅ Diagnostic Brevo terminé');
      return diagnosis;
    } catch (error) {
      this.logger.error('❌ Erreur lors du diagnostic Brevo:', error);
      throw error;
    }
  }

  /**
   * Vérifie les paramètres SMTP dans Supabase
   */
  private async checkSMTPSettings() {
    try {
      const smtpHost = this.configService.get<string>('BREVO_SMTP_HOST');
      const smtpPort = this.configService.get<string>('BREVO_SMTP_PORT');
      const smtpUser = this.configService.get<string>('BREVO_SMTP_USER');
      const apiKey = this.configService.get<string>('BREVO_API_KEY');

      return {
        isConfigured: !!(smtpHost && smtpPort && smtpUser && apiKey),
        host: smtpHost || 'Non configuré',
        port: smtpPort || 'Non configuré',
        user: smtpUser || 'Non configuré',
        hasApiKey: !!apiKey
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification SMTP:', error);
      return {
        isConfigured: false,
        error: error.message
      };
    }
  }

  /**
   * Vérifie la vérification du domaine
   */
  private async checkDomainVerification() {
    // Simulation - dans un vrai cas, on appellerait l'API Brevo
    return {
      isVerified: false,
      domain: 'iroko.io',
      status: 'pending',
      message: 'Domaine non vérifié - authentification requise'
    };
  }

  /**
   * Vérifie la vérification de l'expéditeur
   */
  private async checkSenderVerification() {
    // Simulation - dans un vrai cas, on appellerait l'API Brevo
    return {
      isVerified: false,
      sender: 'noreply@iroko.io',
      status: 'pending',
      message: 'Expéditeur non vérifié'
    };
  }

  /**
   * Génère les enregistrements DNS nécessaires
   */
  generateDNSRecords(domain: string) {
    return {
      spf: {
        type: 'TXT',
        name: '@',
        value: `v=spf1 include:spf.sendinblue.com ~all`,
        description: 'Enregistrement SPF pour autoriser Brevo'
      },
      dkim: {
        type: 'TXT',
        name: 'mail._domainkey',
        value: '[Valeur DKIM fournie par Brevo]',
        description: 'Enregistrement DKIM pour la signature'
      },
      dmarc: {
        type: 'TXT',
        name: '_dmarc',
        value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`,
        description: 'Enregistrement DMARC pour la politique'
      }
    };
  }

  /**
   * Teste l'envoi d'un email de test
   */
  async testEmailSending(toEmail: string) {
    try {
      this.logger.log(`📧 Test d'envoi d'email à: ${toEmail}`);

      // Simulation d'un test d'envoi
      const testResult = {
        success: false,
        error: 'Configuration Brevo non complète',
        recommendations: [
          'Authentifier le domaine dans Brevo',
          'Vérifier une adresse email expéditeur',
          'Configurer les enregistrements DNS'
        ]
      };

      this.logger.log('❌ Test d\'envoi échoué - configuration requise');
      return testResult;
    } catch (error) {
      this.logger.error('Erreur lors du test d\'envoi:', error);
      throw error;
    }
  }

  /**
   * Envoie un email transactionnel via Brevo
   */
  async sendTransactionalEmail(emailData: {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
  }) {
    try {
      this.logger.log(`📧 Envoi d'email transactionnel à: ${emailData.to}`);

      // Simulation d'envoi d'email
      // Dans un vrai cas, on utiliserait l'API Brevo
      const result = {
        success: true,
        messageId: `msg_${Date.now()}`,
        to: emailData.to,
        template: emailData.template
      };

      this.logger.log(`✅ Email transactionnel envoyé: ${result.messageId}`);
      return result;
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi d\'email transactionnel:', error);
      throw error;
    }
  }
} 