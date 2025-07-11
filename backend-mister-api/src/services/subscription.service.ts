import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from './supabase.service';
import { ApiKeyService } from './api-key.service';
import { NotificationService } from './notification.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly apiKeyService: ApiKeyService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Vérifie et met à jour les abonnements expirés
   * Exécuté tous les jours à 2h du matin
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkExpiredSubscriptions() {
    this.logger.log('🔍 Début de la vérification des abonnements expirés...');
    
    try {
      // Appeler la fonction Supabase pour vérifier les abonnements expirés
      const { data, error } = await this.supabaseService.getClient()
        .rpc('execute_subscription_check');

      if (error) {
        this.logger.error('❌ Erreur lors de la vérification des abonnements:', error);
        return;
      }

      this.logger.log('✅ Vérification des abonnements terminée:', data);
      
      // Si des utilisateurs ont été affectés, on peut envoyer des notifications
      if (data.affected_users > 0) {
        await this.handleExpiredSubscriptions(data.affected_users);
      }
    } catch (error) {
      this.logger.error('❌ Erreur lors de la vérification des abonnements:', error);
    }
  }

  /**
   * Gère les actions à effectuer quand des abonnements expirent
   */
  private async handleExpiredSubscriptions(affectedUsers: number) {
    this.logger.log(`📧 ${affectedUsers} utilisateur(s) avec abonnement expiré - Envoi de notifications...`);
    
    try {
      // Récupérer les utilisateurs dont l'abonnement vient d'expirer
      const { data: expiredUsers, error } = await this.supabaseService.getClient()
        .from('users')
        .select('id, email, nom, prenom, premium_expires_at')
        .eq('is_premium', false)
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Dernières 24h

      if (error) {
        this.logger.error('❌ Erreur lors de la récupération des utilisateurs expirés:', error);
        return;
      }

      // Envoyer des notifications d'expiration
      for (const user of expiredUsers) {
        await this.sendExpirationNotification(user);
      }

      this.logger.log(`✅ Notifications envoyées à ${expiredUsers.length} utilisateur(s)`);
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'envoi des notifications:', error);
    }
  }

  /**
   * Envoie une notification d'expiration à un utilisateur
   */
  private async sendExpirationNotification(user: any) {
    try {
      this.logger.log(`📧 Envoi de notification d'expiration à ${user.email}`);
      
      await this.notificationService.sendSubscriptionExpirationNotification({
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        expirationDate: user.premium_expires_at ? new Date(user.premium_expires_at).toLocaleDateString('fr-FR') : 'Aujourd\'hui',
        renewalLink: '/pricing'
      });
      
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi de notification à ${user.email}:`, error);
    }
  }

  /**
   * Envoie une notification de renouvellement d'abonnement
   */
  async sendRenewalNotification(userId: string) {
    try {
      const { data: user, error } = await this.supabaseService.getClient()
        .from('users')
        .select('id, email, nom, prenom')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('Utilisateur non trouvé');
      }

      await this.notificationService.sendSubscriptionRenewalNotification({
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        expirationDate: new Date().toLocaleDateString('fr-FR'),
        renewalLink: '/dashboard'
      });

      this.logger.log(`✅ Notification de renouvellement envoyée à ${user.email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi de notification de renouvellement:`, error);
    }
  }

  /**
   * Envoie une notification de bienvenue pour un nouvel abonnement
   */
  async sendWelcomeNotification(userId: string) {
    try {
      const { data: user, error } = await this.supabaseService.getClient()
        .from('users')
        .select('id, email, nom, prenom')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('Utilisateur non trouvé');
      }

      await this.notificationService.sendWelcomeSubscriptionNotification({
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        expirationDate: new Date().toLocaleDateString('fr-FR'),
        renewalLink: '/dashboard'
      });

      this.logger.log(`✅ Notification de bienvenue envoyée à ${user.email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi de notification de bienvenue:`, error);
    }
  }

  /**
   * Vérifie manuellement les abonnements expirés
   * Peut être appelé via une route admin
   */
  async manualSubscriptionCheck() {
    this.logger.log('🔍 Vérification manuelle des abonnements expirés...');
    
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('execute_subscription_check');

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Vérification des abonnements terminée',
        data: data
      };
    } catch (error) {
      this.logger.error('❌ Erreur lors de la vérification manuelle:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des abonnements
   */
  async getSubscriptionStats() {
    try {
      const { data: stats, error } = await this.supabaseService.getClient()
        .from('users')
        .select('is_premium, premium_expires_at')
        .not('premium_expires_at', 'is', null);

      if (error) {
        throw error;
      }

      const totalUsers = stats.length;
      const premiumUsers = stats.filter(u => u.is_premium).length;
      const expiredUsers = stats.filter(u => !u.is_premium && u.premium_expires_at).length;
      const activeUsers = stats.filter(u => u.is_premium && u.premium_expires_at > new Date().toISOString()).length;

      return {
        success: true,
        data: {
          total: totalUsers,
          premium: premiumUsers,
          expired: expiredUsers,
          active: activeUsers,
          expirationRate: totalUsers > 0 ? (expiredUsers / totalUsers * 100).toFixed(2) : 0
        }
      };
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Force la vérification des abonnements expirés pour un utilisateur spécifique
   */
  async checkUserSubscription(userId: string) {
    try {
      const { data: user, error } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Vérifier si l'abonnement a expiré
      const isExpired = user.premium_expires_at && new Date(user.premium_expires_at) < new Date();
      
      if (isExpired && user.is_premium) {
        // Mettre à jour le statut
        const { error: updateError } = await this.supabaseService.getClient()
          .from('users')
          .update({ 
            is_premium: false, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Envoyer notification d'expiration
        await this.sendExpirationNotification(user);

        this.logger.log(`✅ Abonnement expiré pour l'utilisateur ${userId}`);
        return {
          success: true,
          message: 'Abonnement marqué comme expiré',
          data: { userId, wasExpired: true }
        };
      }

      return {
        success: true,
        message: 'Abonnement vérifié',
        data: { userId, wasExpired: false, isPremium: user.is_premium }
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la vérification de l'abonnement pour ${userId}:`, error);
      throw error;
    }
  }
} 