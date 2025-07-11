import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription, NewsletterStatus } from '../entities/newsletter-subscription.entity';
import { CreateNewsletterSubscriptionDto, UpdateNewsletterSubscriptionDto, NewsletterQueryDto } from '../dto/newsletter.dto';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import * as crypto from 'crypto';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly newsletterRepository: Repository<NewsletterSubscription>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Crée un nouvel abonnement à la newsletter
   */
  async createSubscription(createDto: CreateNewsletterSubscriptionDto): Promise<ApiResponse<any>> {
    try {
      // Générer les tokens
      const tokenConfirmation = crypto.randomBytes(32).toString('hex');
      const tokenDesabonnement = crypto.randomBytes(32).toString('hex');

      // Vérifier si l'email existe déjà
      const existingSubscription = await this.newsletterRepository.findOne({
        where: { email: createDto.email }
      });

      if (existingSubscription) {
        // Mettre à jour l'abonnement existant
        existingSubscription.nom = createDto.nom;
        existingSubscription.prenom = createDto.prenom;
        existingSubscription.status = NewsletterStatus.PENDING;
        existingSubscription.token_confirmation = tokenConfirmation;
        existingSubscription.token_desabonnement = tokenDesabonnement;
        existingSubscription.preferences = createDto.preferences || {};
        existingSubscription.source = createDto.source || 'site_web';
        existingSubscription.date_desabonnement = undefined;

        const updatedSubscription = await this.newsletterRepository.save(existingSubscription);

        // Envoyer email de confirmation
        await this.notificationService.sendNewsletterConfirmation(
          createDto.email,
          createDto.nom,
          tokenConfirmation
        );

        return {
          success: true,
          message: 'Abonnement à la newsletter mis à jour. Vérifiez votre email pour confirmer.',
          data: { subscription: updatedSubscription }
        };
      }

      // Créer un nouvel abonnement
      const newSubscription = this.newsletterRepository.create({
        email: createDto.email,
        nom: createDto.nom,
        prenom: createDto.prenom,
        status: NewsletterStatus.PENDING,
        token_confirmation: tokenConfirmation,
        token_desabonnement: tokenDesabonnement,
        preferences: createDto.preferences || {},
        source: createDto.source || 'site_web',
      });

      const savedSubscription = await this.newsletterRepository.save(newSubscription);

      // Envoyer email de confirmation
      await this.notificationService.sendNewsletterConfirmation(
        createDto.email,
        createDto.nom,
        tokenConfirmation
      );

      return {
        success: true,
        message: 'Abonnement à la newsletter créé. Vérifiez votre email pour confirmer.',
        data: { subscription: savedSubscription }
      };
    } catch (error) {
      this.logger.error('Erreur lors de la création de l\'abonnement newsletter:', error);
      throw error;
    }
  }

  /**
   * Confirme un abonnement à la newsletter
   */
  async confirmSubscription(token: string): Promise<ApiResponse<any>> {
    try {
      const subscription = await this.newsletterRepository.findOne({
        where: { token_confirmation: token }
      });

      if (!subscription) {
        return {
          success: false,
          message: 'Token de confirmation invalide ou expiré'
        };
      }

      if (subscription.status === NewsletterStatus.ACTIVE) {
        return {
          success: false,
          message: 'Cet abonnement est déjà confirmé'
        };
      }

      // Confirmer l'abonnement
      subscription.status = NewsletterStatus.ACTIVE;
      subscription.date_confirmation = new Date();
      subscription.is_verified = true;

      const confirmedSubscription = await this.newsletterRepository.save(subscription);

      return {
        success: true,
        message: 'Abonnement à la newsletter confirmé avec succès',
        data: { subscription: confirmedSubscription }
      };
    } catch (error) {
      this.logger.error('Erreur lors de la confirmation de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Désabonne un utilisateur de la newsletter
   */
  async unsubscribe(token: string): Promise<ApiResponse<any>> {
    try {
      const subscription = await this.newsletterRepository.findOne({
        where: { token_desabonnement: token }
      });

      if (!subscription) {
        return {
          success: false,
          message: 'Token de désabonnement invalide'
        };
      }

      if (subscription.status === NewsletterStatus.UNSUBSCRIBED) {
        return {
          success: false,
          message: 'Cet abonnement est déjà désactivé'
        };
      }

      // Désabonner
      subscription.status = NewsletterStatus.UNSUBSCRIBED;
      subscription.date_desabonnement = new Date();

      const unsubscribedSubscription = await this.newsletterRepository.save(subscription);

      // Envoyer email de confirmation de désabonnement
      await this.notificationService.sendNewsletterUnsubscribeConfirmation(
        subscription.email,
        subscription.nom
      );

      return {
        success: true,
        message: 'Désabonnement effectué avec succès',
        data: { subscription: unsubscribedSubscription }
      };
    } catch (error) {
      this.logger.error('Erreur lors du désabonnement:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les abonnements avec filtres
   */
  async findAll(query: NewsletterQueryDto): Promise<ApiResponse<any>> {
    try {
      const { page = 1, limit = 20, search, status, source } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.newsletterRepository.createQueryBuilder('newsletter');

      // Appliquer les filtres
      if (search) {
        queryBuilder.where(
          '(newsletter.email ILIKE :search OR newsletter.nom ILIKE :search OR newsletter.prenom ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (status) {
        queryBuilder.andWhere('newsletter.status = :status', { status });
      }

      if (source) {
        queryBuilder.andWhere('newsletter.source = :source', { source });
      }

      // Compter le total
      const total = await queryBuilder.getCount();

      // Récupérer les données
      const subscriptions = await queryBuilder
        .orderBy('newsletter.created_at', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      return {
        success: true,
        message: 'Abonnements récupérés avec succès',
        data: {
          subscriptions,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des abonnements:', error);
      throw error;
    }
  }

  /**
   * Récupère un abonnement par ID
   */
  async findOne(id: string): Promise<ApiResponse<any>> {
    try {
      const subscription = await this.newsletterRepository.findOne({
        where: { id }
      });

      if (!subscription) {
        return {
          success: false,
          message: 'Abonnement non trouvé'
        };
      }

      return {
        success: true,
        message: 'Abonnement récupéré avec succès',
        data: { subscription }
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Met à jour un abonnement
   */
  async update(id: string, updateDto: UpdateNewsletterSubscriptionDto): Promise<ApiResponse<any>> {
    try {
      const subscription = await this.newsletterRepository.findOne({
        where: { id }
      });

      if (!subscription) {
        return {
          success: false,
          message: 'Abonnement non trouvé'
        };
      }

      // Mettre à jour les champs
      Object.assign(subscription, updateDto);

      const updatedSubscription = await this.newsletterRepository.save(subscription);

      return {
        success: true,
        message: 'Abonnement mis à jour avec succès',
        data: { subscription: updatedSubscription }
      };
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Supprime un abonnement
   */
  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const subscription = await this.newsletterRepository.findOne({
        where: { id }
      });

      if (!subscription) {
        return {
          success: false,
          message: 'Abonnement non trouvé'
        };
      }

      await this.newsletterRepository.remove(subscription);

      return {
        success: true,
        message: 'Abonnement supprimé avec succès'
      };
    } catch (error) {
      this.logger.error('Erreur lors de la suppression de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de la newsletter
   */
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await this.newsletterRepository
        .createQueryBuilder('newsletter')
        .select([
          'newsletter.status',
          'newsletter.source',
          'COUNT(*) as count'
        ])
        .groupBy('newsletter.status, newsletter.source')
        .getRawMany();

      const totalSubscribers = await this.newsletterRepository.count({
        where: { status: NewsletterStatus.ACTIVE }
      });

      const pendingSubscribers = await this.newsletterRepository.count({
        where: { status: NewsletterStatus.PENDING }
      });

      const todaySubscribers = await this.newsletterRepository.count({
        where: {
          status: NewsletterStatus.ACTIVE,
          date_confirmation: new Date()
        }
      });

      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: {
          totalSubscribers,
          pendingSubscribers,
          todaySubscribers,
          statsByStatus: stats.filter(s => s.newsletter_status),
          statsBySource: stats.filter(s => s.newsletter_source)
        }
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Envoie une newsletter à tous les abonnés actifs
   */
  async sendNewsletter(subject: string, content: string): Promise<ApiResponse<any>> {
    try {
      const activeSubscribers = await this.newsletterRepository.find({
        where: { status: NewsletterStatus.ACTIVE },
        select: ['email', 'nom', 'prenom']
      });

      if (activeSubscribers.length === 0) {
        return {
          success: false,
          message: 'Aucun abonné actif trouvé'
        };
      }

      const result = await this.notificationService.sendNewsletterToSubscribers(
        subject,
        content,
        activeSubscribers
      );

      return {
        success: true,
        message: `Newsletter envoyée à ${result.success} abonnés (${result.failed} échecs)`,
        data: result
      };
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de la newsletter:', error);
      throw error;
    }
  }

  /**
   * Nettoie les tokens expirés (plus de 7 jours)
   */
  async cleanupExpiredTokens(): Promise<ApiResponse<any>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await this.newsletterRepository
        .createQueryBuilder()
        .delete()
        .where('status = :status AND created_at < :date', {
          status: NewsletterStatus.PENDING,
          date: sevenDaysAgo
        })
        .execute();

      return {
        success: true,
        message: `${result.affected} abonnements expirés supprimés`,
        data: { deletedCount: result.affected }
      };
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des tokens expirés:', error);
      throw error;
    }
  }
} 