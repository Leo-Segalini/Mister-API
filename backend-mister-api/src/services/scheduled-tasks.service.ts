import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiKeyService } from './api-key.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { ApiLog } from '../entities/api-log.entity';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private readonly apiKeyService: ApiKeyService,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
  ) {}

  /**
   * Rotation automatique des clés API expirées
   * Exécuté tous les jours à 2h du matin
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async rotateExpiredApiKeys() {
    this.logger.log('Début de la rotation automatique des clés API expirées');
    
    try {
      await this.apiKeyService.rotateExpiredKeys();
      this.logger.log('Rotation automatique des clés API terminée avec succès');
    } catch (error) {
      this.logger.error('Erreur lors de la rotation automatique des clés API:', error);
    }
  }

  /**
   * Nettoyage des logs anciens
   * Exécuté tous les dimanches à 3h du matin
   */
  @Cron('0 3 * * 0') // Tous les dimanches à 3h
  async cleanupOldLogs() {
    this.logger.log('Début du nettoyage des logs anciens');
    
    try {
      // Supprimer les logs de plus de 90 jours
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const result = await this.apiLogRepository.delete({
        created_at: { $lt: ninetyDaysAgo } as any,
      });
      
      this.logger.log(`Nettoyage terminé: ${result.affected} logs supprimés`);
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des logs:', error);
    }
  }

  /**
   * Analyse de sécurité quotidienne
   * Exécuté tous les jours à 6h du matin
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailySecurityAnalysis() {
    this.logger.log('Début de l\'analyse de sécurité quotidienne');
    
    try {
      // Récupérer toutes les clés API actives
      const activeKeys = await this.apiKeyRepository.find({
        where: { is_active: true },
      });

      for (const key of activeKeys) {
        await this.analyzeKeySecurity(key.id);
      }
      
      this.logger.log('Analyse de sécurité quotidienne terminée');
    } catch (error) {
      this.logger.error('Erreur lors de l\'analyse de sécurité:', error);
    }
  }

  /**
   * Reset des quotas quotidiens
   * Exécuté tous les jours à minuit
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyQuotas() {
    this.logger.log('Début du reset des quotas quotidiens');
    
    try {
      const result = await this.apiKeyRepository.update(
        {},
        {
          appels_jour: 0,
          updated_at: new Date(),
        }
      );
      
      this.logger.log(`Reset des quotas terminé: ${result.affected} clés mises à jour`);
    } catch (error) {
      this.logger.error('Erreur lors du reset des quotas:', error);
    }
  }

  /**
   * Analyse de sécurité pour une clé API spécifique
   */
  private async analyzeKeySecurity(apiKeyId: string): Promise<void> {
    try {
      const securityStats = await this.apiKeyService.getSecurityStats(apiKeyId);
      
      // Vérifier les critères de sécurité
      const isSuspicious = this.checkSecurityCriteria(securityStats);
      
      if (isSuspicious) {
        this.logger.warn(`Activité suspecte détectée pour la clé API ${apiKeyId}`);
        
        // Optionnel : Désactiver automatiquement la clé
        if (securityStats.suspiciousActivities > 10) {
          await this.apiKeyService.updateByUser(apiKeyId, {
            is_active: false,
          }, 'system');
        }
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'analyse de sécurité pour la clé ${apiKeyId}:`, error);
    }
  }

  /**
   * Vérifie les critères de sécurité
   */
  private checkSecurityCriteria(stats: any): boolean {
    return (
      stats.uniqueIps > 5 ||
      stats.uniqueUserAgents > 3 ||
      stats.suspiciousActivities > 5 ||
      stats.totalCalls > 10000 // Plus de 10k appels en 1000 derniers logs
    );
  }

  /**
   * Génération de rapports de sécurité hebdomadaires
   * Exécuté tous les lundis à 8h du matin
   */
  @Cron('0 8 * * 1') // Tous les lundis à 8h
  async generateWeeklySecurityReport() {
    this.logger.log('Génération du rapport de sécurité hebdomadaire');
    
    try {
      const report = await this.generateSecurityReport();
      this.logger.log('Rapport de sécurité hebdomadaire généré:', report);
      
      // Ici vous pourriez envoyer le rapport par email ou le stocker
      // await this.emailService.sendSecurityReport(report);
    } catch (error) {
      this.logger.error('Erreur lors de la génération du rapport de sécurité:', error);
    }
  }

  /**
   * Génère un rapport de sécurité
   */
  private async generateSecurityReport(): Promise<any> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const totalKeys = await this.apiKeyRepository.count();
    const activeKeys = await this.apiKeyRepository.count({ where: { is_active: true } });
    const deactivatedKeys = await this.apiKeyRepository.count({ where: { is_active: false } });
    
    const recentLogs = await this.apiLogRepository.count({
      where: { created_at: { $gte: oneWeekAgo } as any },
    });
    
    const suspiciousLogs = await this.apiLogRepository.count({
      where: { 
        endpoint: 'SECURITY_CHECK',
        created_at: { $gte: oneWeekAgo } as any,
      },
    });
    
    return {
      period: '7 derniers jours',
      totalKeys,
      activeKeys,
      deactivatedKeys,
      totalApiCalls: recentLogs,
      suspiciousActivities: suspiciousLogs,
      securityScore: this.calculateSecurityScore(recentLogs, suspiciousLogs),
      recommendations: this.generateRecommendations(recentLogs, suspiciousLogs),
    };
  }

  /**
   * Calcule un score de sécurité
   */
  private calculateSecurityScore(totalCalls: number, suspiciousCalls: number): number {
    if (totalCalls === 0) return 100;
    const suspiciousRatio = suspiciousCalls / totalCalls;
    return Math.max(0, 100 - (suspiciousRatio * 100));
  }

  /**
   * Génère des recommandations de sécurité
   */
  private generateRecommendations(totalCalls: number, suspiciousCalls: number): string[] {
    const recommendations: string[] = [];
    
    if (suspiciousCalls > totalCalls * 0.1) {
      recommendations.push('Taux d\'activités suspectes élevé - Vérifier les clés API');
    }
    
    if (totalCalls > 100000) {
      recommendations.push('Volume d\'appels élevé - Considérer l\'optimisation');
    }
    
    if (suspiciousCalls > 50) {
      recommendations.push('Nombre d\'activités suspectes important - Renforcer la sécurité');
    }
    
    return recommendations;
  }
} 