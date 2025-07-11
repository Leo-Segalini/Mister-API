import { Injectable, Logger, UnauthorizedException, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { ApiLog } from '../entities/api-log.entity';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../interfaces/api-response.interface';
import { SupabaseService } from './supabase.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);
  
  // Cache pour les tentatives d'utilisation suspectes
  private suspiciousAttempts = new Map<string, { count: number; lastAttempt: Date; ips: Set<string> }>();

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Valide une clé API avec sécurité renforcée contre le partage
   */
  async validateApiKey(apiKey: string, tableName: string, req: Request): Promise<ApiKey> {
    const keyData = await this.apiKeyRepository.findOne({
      where: { api_key: apiKey, is_active: true },
      relations: ['user'],
    });

    if (!keyData) {
      throw new UnauthorizedException('Clé API invalide ou désactivée');
    }

    // Vérifier que la clé API correspond à la table demandée
    if (keyData.table_name !== tableName) {
      throw new UnauthorizedException(`Clé API non autorisée pour la table ${tableName}`);
    }

    // Vérifier l'expiration
    if (keyData.expires_at && new Date() > keyData.expires_at) {
      throw new UnauthorizedException('Clé API expirée');
    }

    // SÉCURITÉ RENFORCÉE : Vérifications anti-partage
    await this.performSecurityChecks(keyData, req);

    return keyData;
  }

  /**
   * Effectue toutes les vérifications de sécurité contre le partage
   */
  private async performSecurityChecks(apiKey: ApiKey, req: Request): Promise<void> {
    const clientIp = this.getClientIp(req);
    const userAgent = req.get('User-Agent') || '';
    const fingerprint = this.generateClientFingerprint(req);

    // 1. Détection d'utilisation simultanée depuis plusieurs IPs
    await this.detectMultiIpUsage(apiKey.id, clientIp);

    // 2. Vérification du User-Agent (détection de partage)
    await this.validateUserAgent(apiKey.id, userAgent);

    // 3. Vérification du fingerprint client
    await this.validateClientFingerprint(apiKey.id, fingerprint);

    // 4. Détection de patterns d'utilisation suspects
    await this.detectSuspiciousPatterns(apiKey.id, req);

    // 5. Vérification de la fréquence d'utilisation
    await this.checkUsageFrequency(apiKey.id);
  }

  /**
   * Génère un fingerprint unique du client
   */
  private generateClientFingerprint(req: Request): string {
    const components = [
      req.get('User-Agent'),
      req.get('Accept-Language'),
      req.get('Accept-Encoding'),
      req.get('Accept'),
      req.get('Cache-Control'),
      req.get('Connection'),
      req.get('Upgrade-Insecure-Requests'),
    ].filter(Boolean);

    const fingerprint = crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex');

    return fingerprint;
  }

  /**
   * Récupère l'IP réelle du client
   */
  private getClientIp(req: Request): string {
    return (
      req.get('X-Forwarded-For')?.split(',')[0] ||
      req.get('X-Real-IP') ||
      req.get('CF-Connecting-IP') ||
      req.ip ||
      req.connection.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Détecte l'utilisation depuis plusieurs IPs (signe de partage)
   */
  private async detectMultiIpUsage(apiKeyId: string, currentIp: string): Promise<void> {
    const recentLogs = await this.apiLogRepository.find({
      where: { api_key_id: apiKeyId },
      order: { created_at: 'DESC' },
      take: 100,
    });

    const uniqueIps = new Set(recentLogs.map(log => log.ip_address));
    
    // Si plus de 3 IPs différentes dans les 100 derniers appels, c'est suspect
    if (uniqueIps.size > 3) {
      await this.handleSuspiciousActivity(apiKeyId, 'Utilisation depuis plusieurs IPs', { ip: currentIp });
      
      // Optionnel : Désactiver automatiquement la clé
      if (uniqueIps.size > 5) {
        await this.disableApiKey(apiKeyId, 'Détection de partage - Trop d\'IPs différentes');
      }
    }
  }

  /**
   * Valide le User-Agent (détection de partage)
   */
  private async validateUserAgent(apiKeyId: string, userAgent: string): Promise<void> {
    const recentLogs = await this.apiLogRepository.find({
      where: { api_key_id: apiKeyId },
      order: { created_at: 'DESC' },
      take: 50,
    });

    const uniqueUserAgents = new Set(recentLogs.map(log => log.user_agent));
    
    // Si plus de 2 User-Agents différents, c'est suspect
    if (uniqueUserAgents.size > 2) {
      await this.handleSuspiciousActivity(apiKeyId, 'Utilisation avec plusieurs User-Agents', { userAgent });
    }
  }

  /**
   * Valide le fingerprint client
   */
  private async validateClientFingerprint(apiKeyId: string, fingerprint: string): Promise<void> {
    // Stocker le fingerprint dans les logs pour validation future
    // Cette méthode peut être étendue pour comparer avec les fingerprints précédents
  }

  /**
   * Détecte les patterns d'utilisation suspects
   */
  private async detectSuspiciousPatterns(apiKeyId: string, req: Request): Promise<void> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    // Vérifier les appels récents (dernière minute)
    const recentCalls = await this.apiLogRepository.count({
      where: {
        api_key_id: apiKeyId,
        created_at: MoreThanOrEqual(oneMinuteAgo),
      },
    });

    // Si plus de 30 appels par minute, c'est suspect
    if (recentCalls > 30) {
      await this.handleSuspiciousActivity(apiKeyId, 'Trop d\'appels par minute', req);
    }

    // Vérifier les appels simultanés
    const simultaneousCalls = await this.apiLogRepository.count({
      where: {
        api_key_id: apiKeyId,
        created_at: MoreThanOrEqual(new Date(now.getTime() - 5000)), // 5 secondes
      },
    });

    // Si plus de 5 appels simultanés, c'est suspect
    if (simultaneousCalls > 5) {
      await this.handleSuspiciousActivity(apiKeyId, 'Appels simultanés suspects', req);
    }
  }

  /**
   * Vérifie la fréquence d'utilisation
   */
  private async checkUsageFrequency(apiKeyId: string): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    const hourlyCalls = await this.apiLogRepository.count({
      where: {
        api_key_id: apiKeyId,
        created_at: MoreThanOrEqual(oneHourAgo),
      },
    });

    // Si plus de 1000 appels par heure, c'est suspect
    if (hourlyCalls > 1000) {
      await this.handleSuspiciousActivity(apiKeyId, 'Fréquence d\'utilisation excessive', {});
    }
  }

  /**
   * Gère les activités suspectes
   */
  private async handleSuspiciousActivity(apiKeyId: string, reason: string, context: any): Promise<void> {
    this.logger.warn(`Activité suspecte détectée pour la clé API ${apiKeyId}: ${reason}`, context);

    // Incrémenter le compteur d'activités suspectes
    const key = `suspicious_${apiKeyId}`;
    const current = this.suspiciousAttempts.get(key) || { count: 0, lastAttempt: new Date(), ips: new Set() };
    
    current.count++;
    current.lastAttempt = new Date();
    if (context.ip) current.ips.add(context.ip);
    
    this.suspiciousAttempts.set(key, current);

    // Si trop d'activités suspectes, désactiver la clé
    if (current.count >= 5) {
      await this.disableApiKey(apiKeyId, `Trop d'activités suspectes: ${reason}`);
    }

    // Log l'activité suspecte
    const suspiciousLog = new ApiLog();
    suspiciousLog.api_key_id = apiKeyId;
    suspiciousLog.endpoint = 'SECURITY_CHECK';
    suspiciousLog.method = 'SECURITY';
    suspiciousLog.status_code = 403;
    suspiciousLog.ip_address = context.ip || 'unknown';
    suspiciousLog.user_agent = context.userAgent || 'unknown';
    suspiciousLog.request_data = { reason, context };
    
    await this.apiLogRepository.save(suspiciousLog);
  }

  /**
   * Désactive une clé API
   */
  private async disableApiKey(apiKeyId: string, reason: string): Promise<void> {
    await this.apiKeyRepository.update(
      { id: apiKeyId },
      {
      is_active: false,
        updated_at: new Date(),
      }
    );
  }

  /**
   * Vérifie les quotas d'une clé API
   */
  async checkQuota(apiKeyId: string): Promise<boolean> {
    this.logger.debug(`🔍 Vérification quota pour la clé API: ${apiKeyId}`);
    
    // Récupérer les données de la clé API avec les statistiques d'usage depuis la vue
    const keyWithStats = await this.apiKeyRepository
      .createQueryBuilder('ak')
      .leftJoin('api_key_usage_stats', 'stats', 'ak.id = stats.id')
      .select([
        'ak.id',
        'ak.type',
        'ak.appels_jour',
        'ak.appels_minute',
        'ak.quota_horaire',
        'ak.quota_mensuel',
        'stats.calls_today as stats_calls_today',
        'stats.total_calls as stats_total_calls'
      ])
      .where('ak.id = :apiKeyId', { apiKeyId })
      .getRawOne();

    this.logger.debug(`🔍 Données récupérées:`, keyWithStats);

    if (!keyWithStats) {
      this.logger.error(`❌ Clé API non trouvée: ${apiKeyId}`);
      throw new UnauthorizedException('Clé API invalide');
    }

    // Utiliser les quotas personnalisés de la clé ou les valeurs par défaut
    const quotaJournalier = keyWithStats.ak_appels_jour || this.getDefaultQuota(keyWithStats.ak_type, 'daily');
    const quotaMinute = keyWithStats.ak_appels_minute || this.getDefaultQuota(keyWithStats.ak_type, 'minute');
    const callsToday = parseInt(keyWithStats.stats_calls_today) || 0;

    this.logger.debug(`🔍 Quotas: Journalier=${quotaJournalier}, Minute=${quotaMinute}, Appels aujourd'hui=${callsToday}`);

    // Vérification du quota journalier avec calls_today de la vue
    if (quotaJournalier > 0 && callsToday >= quotaJournalier) {
      this.logger.warn(`🚫 Quota journalier dépassé pour la clé API ${apiKeyId} (${keyWithStats.ak_type}): ${callsToday}/${quotaJournalier}`);
      return false;
    }

    // Vérification du quota par minute (calcul en temps réel)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    
    const minuteCalls = await this.apiLogRepository.count({
      where: {
        api_key_id: apiKeyId,
        created_at: MoreThanOrEqual(oneMinuteAgo),
      },
    });

    this.logger.debug(`🔍 Appels dernière minute: ${minuteCalls}`);

    if (quotaMinute > 0 && minuteCalls >= quotaMinute) {
      this.logger.warn(`🚫 Quota par minute dépassé pour la clé API ${apiKeyId} (${keyWithStats.ak_type}): ${minuteCalls}/${quotaMinute}`);
      return false;
    }

    // Vérification des quotas horaires (préparation future)
    if (keyWithStats.ak_quota_horaire > 0) {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const hourlyCalls = await this.apiLogRepository.count({
        where: {
          api_key_id: apiKeyId,
          created_at: MoreThanOrEqual(oneHourAgo),
        },
      });

      if (hourlyCalls >= keyWithStats.ak_quota_horaire) {
        this.logger.warn(`🚫 Quota horaire dépassé pour la clé API ${apiKeyId}: ${hourlyCalls}/${keyWithStats.ak_quota_horaire}`);
        return false;
      }
    }

    this.logger.debug(`✅ Quota OK pour la clé API ${apiKeyId} (${keyWithStats.ak_type}): ${callsToday}/${quotaJournalier} quotidien, ${minuteCalls}/${quotaMinute} par minute`);
    return true;
  }

  /**
   * Récupère les quotas par défaut selon le type de clé
   */
  private getDefaultQuota(type: string, period: 'daily' | 'minute' | 'hourly'): number {
    const defaultQuotas = {
      free: {
        daily: 500,      // 500 appels par jour pour les clés gratuites
        minute: 5,       // 5 appels par minute pour les clés gratuites
        hourly: 0        // 0 = illimité
      },
      premium: {
        daily: 150000,   // 150 000 appels par jour pour les clés premium
        minute: 100,     // 100 appels par minute pour les clés premium
        hourly: 0        // 0 = illimité
      }
    };

    return defaultQuotas[type]?.[period] || defaultQuotas.free[period];
  }

  /**
   * Génère une nouvelle clé API avec quotas automatiques selon le type
   */
  async generateApiKey(userId: string, tableName: string, name: string, type: 'free' | 'premium' = 'free'): Promise<ApiKey> {
    // Récupérer les quotas par défaut selon le type
    const quotaJournalier = this.getDefaultQuota(type, 'daily');
    const quotaMinute = this.getDefaultQuota(type, 'minute');
    
    this.logger.debug(`🔑 Génération clé API ${type}: ${quotaJournalier} appels/jour, ${quotaMinute} appels/minute`);

    const apiKey = this.apiKeyRepository.create({
      user_id: userId,
      table_name: tableName,
      api_key: `pk_${uuidv4().replace(/-/g, '')}`,
      name: name,
      type: type,
      is_active: true,
      appels_jour: quotaJournalier,      // Quota journalier automatique
      appels_minute: quotaMinute,        // Quota minute automatique
      quota_horaire: 0,                  // Quota horaire (0 = illimité)
      quota_mensuel: 0,                  // Quota mensuel (0 = illimité)
      last_used_at: new Date(),
    });

    const savedKey = await this.apiKeyRepository.save(apiKey) as unknown as ApiKey;
    
    this.logger.log(`✅ Clé API ${type} créée: ${savedKey.name} (${quotaJournalier} appels/jour, ${quotaMinute} appels/minute)`);
    
    return savedKey;
  }

  /**
   * Rotation automatique des clés API expirées
   */
  async rotateExpiredKeys(): Promise<void> {
    const expiredKeys = await this.apiKeyRepository.find({
      where: {
        expires_at: LessThan(new Date()),
        is_active: true,
      },
    });

    for (const key of expiredKeys) {
      // Générer une nouvelle clé
      const newKey = await this.generateApiKey(
        key.user_id,
        key.table_name,
        `${key.name} (renouvelée)`,
        key.type
      );

      // Désactiver l'ancienne clé
      await this.disableApiKey(key.id, 'Rotation automatique - Nouvelle clé générée');

      this.logger.log(`Clé API ${key.id} renouvelée automatiquement. Nouvelle clé: ${newKey.id}`);
    }
  }

  /**
   * Obtient les statistiques de sécurité pour une clé API
   */
  async getSecurityStats(apiKeyId: string): Promise<any> {
    const recentLogs = await this.apiLogRepository.find({
      where: { api_key_id: apiKeyId },
      order: { created_at: 'DESC' },
      take: 1000,
    });

    const uniqueIps = new Set(recentLogs.map(log => log.ip_address));
    const uniqueUserAgents = new Set(recentLogs.map(log => log.user_agent));
    const suspiciousActivities = recentLogs.filter(log => log.endpoint === 'SECURITY_CHECK');

    return {
      totalCalls: recentLogs.length,
      uniqueIps: uniqueIps.size,
      uniqueUserAgents: uniqueUserAgents.size,
      suspiciousActivities: suspiciousActivities.length,
      lastSuspiciousActivity: suspiciousActivities[0]?.created_at,
      ipList: Array.from(uniqueIps),
      userAgentList: Array.from(uniqueUserAgents),
    };
  }

  /**
   * Récupère les activités suspectes récentes
   */
  async getSuspiciousActivities(limit: number = 50): Promise<any[]> {
    const suspiciousLogs = await this.apiLogRepository.find({
      where: { endpoint: 'SECURITY_CHECK' },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['apiKey'],
    });

    return suspiciousLogs.map(log => ({
      id: log.id,
      apiKeyId: log.api_key_id,
      apiKeyName: log.apiKey?.name,
      reason: log.request_data?.reason,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      timestamp: log.created_at,
      context: log.request_data?.context,
    }));
  }

  /**
   * Récupère toutes les clés API d'un utilisateur
   */
  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return await this.apiKeyRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Supprime une clé API
   */
  async deleteApiKey(apiKeyId: string, userId: string): Promise<boolean> {
    const result = await this.apiKeyRepository.delete({
      id: apiKeyId,
      user_id: userId,
    });

    return (result.affected || 0) > 0;
  }

  /**
   * Met à jour une clé API
   */
  async updateApiKey(apiKeyId: string, userId: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    await this.apiKeyRepository.update(
      { id: apiKeyId, user_id: userId },
      updates
    );

    const updatedKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
    });

    if (!updatedKey) {
      throw new HttpException('Clé API non trouvée', HttpStatus.NOT_FOUND);
    }

    return updatedKey;
  }

  /**
   * Log un appel API
   */
  async logApiCall(apiKeyId: string, req: Request, res: Response, tableName: string): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Attendre la fin de la réponse pour calculer le temps de réponse
      const originalSend = res.send;
      const self = this;
      
      res.send = function(data) {
        const responseTime = Date.now() - startTime;
        
        // Log asynchrone pour ne pas bloquer la réponse
        setImmediate(async () => {
          try {
            const apiLog = new ApiLog();
            apiLog.api_key_id = apiKeyId;
            apiLog.user_id = req['userId'];
            apiLog.table_name = tableName;
            apiLog.endpoint = req.path;
            apiLog.method = req.method;
            apiLog.status_code = res.statusCode;
            apiLog.response_time = responseTime;
            apiLog.ip_address = req.ip || req.connection.remoteAddress;
            apiLog.user_agent = req.get('User-Agent');
            apiLog.request_data = {
              query: req.query,
              body: req.body,
              headers: {
                'content-type': req.get('Content-Type'),
                'accept': req.get('Accept'),
              },
            };

            await self.apiLogRepository.save(apiLog);
          } catch (error) {
            self.logger.error('Erreur lors du logging de l\'appel API:', error);
          }
        });

        return originalSend.call(this, data);
      };
    } catch (error) {
      this.logger.error('Erreur lors de la configuration du logging:', error);
    }
  }

  /**
   * Récupère les statistiques d'utilisation d'une clé API depuis la vue api_key_usage_stats
   */
  async getApiKeyUsageStats(apiKeyId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      // Vérifier que la clé API appartient à l'utilisateur
      const apiKey = await this.apiKeyRepository.findOne({
        where: { id: apiKeyId, user_id: userId },
      });

      if (!apiKey) {
        throw new HttpException('Clé API non trouvée', HttpStatus.NOT_FOUND);
      }

      // Récupérer les statistiques depuis la vue api_key_usage_stats
      const usageStats = await this.apiKeyRepository
        .createQueryBuilder('ak')
        .select([
          'stats.id as stats_id',
          'stats.api_key_name as stats_api_key_name',
          'stats.user_id as stats_user_id',
          'stats.user_email as stats_user_email',
          'stats.total_requests as stats_total_requests',
          'stats.successful_requests as stats_successful_requests',
          'stats.failed_requests as stats_failed_requests',
          'stats.average_response_time as stats_average_response_time',
          'stats.last_request_at as stats_last_request_at',
          'stats.calls_today as stats_calls_today',
          'stats.total_calls as stats_total_calls'
        ])
        .leftJoin('api_key_usage_stats', 'stats', 'ak.id = stats.id')
        .where('ak.id = :apiKeyId', { apiKeyId })
        .getRawOne();

      if (!usageStats) {
        // Si aucune statistique n'est trouvée, retourner des données par défaut
        return {
          success: true,
          message: 'Statistiques récupérées avec succès',
          data: {
            id: apiKey.id,
            api_key_name: apiKey.name,
            user_id: apiKey.user_id,
            user_email: '', // À récupérer depuis la table users si nécessaire
            total_requests: 0,
            successful_requests: 0,
            failed_requests: 0,
            average_response_time: 0,
            last_request_at: apiKey.last_used_at || new Date().toISOString(),
            calls_today: apiKey.appels_jour || 0,
            total_calls: apiKey.appels_jour || 0
          }
        };
      }

      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: {
          id: usageStats.stats_id,
          api_key_name: usageStats.stats_api_key_name,
          user_id: usageStats.stats_user_id,
          user_email: usageStats.stats_user_email,
          total_requests: parseInt(usageStats.stats_total_requests) || 0,
          successful_requests: parseInt(usageStats.stats_successful_requests) || 0,
          failed_requests: parseInt(usageStats.stats_failed_requests) || 0,
          average_response_time: parseFloat(usageStats.stats_average_response_time) || 0,
          last_request_at: usageStats.stats_last_request_at || apiKey.last_used_at || new Date().toISOString(),
          calls_today: parseInt(usageStats.stats_calls_today) || apiKey.appels_jour || 0,
          total_calls: parseInt(usageStats.stats_total_calls) || apiKey.appels_jour || 0
        }
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des statistiques d'utilisation: ${error.message}`);
      throw new BadRequestException('Erreur lors de la récupération des statistiques d\'utilisation');
    }
  }

  /**
   * Obtient les statistiques d'une clé API
   */
  async getApiKeyStats(apiKeyId: string): Promise<any> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
    });

    if (!apiKey) {
      throw new HttpException('Clé API non trouvée', HttpStatus.NOT_FOUND);
    }

    const recentLogs = await this.apiLogRepository.find({
      where: { api_key_id: apiKeyId },
      order: { created_at: 'DESC' },
      take: 100,
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      type: apiKey.type,
      appels_jour: apiKey.appels_jour,
      appels_minute: apiKey.appels_minute,
      is_active: apiKey.is_active,
      created_at: apiKey.created_at,
      last_used_at: apiKey.last_used_at,
      recent_calls: recentLogs.length,
      average_response_time: recentLogs.length > 0 
        ? recentLogs.reduce((sum, log) => sum + log.response_time, 0) / recentLogs.length 
        : 0,
    };
  }

  /**
   * Récupère les statistiques d'un utilisateur
   */
  async getUserStats(userId: string): Promise<any[]> {
    const apiKeys = await this.apiKeyRepository.find({
      where: { user_id: userId },
    });

    return await Promise.all(
      apiKeys.map(apiKey => this.getApiKeyStats(apiKey.id)),
    );
  }

  /**
   * Crée une nouvelle clé API
   */
  async create(createApiKeyDto: any, userId: string): Promise<ApiResponse<any>> {
    try {
      // Vérifier le statut premium de l'utilisateur
      const { role, isPremium } = await this.supabaseService.getUserRoleAndPremium(userId);
      
      // Déterminer le type de clé API selon le statut de l'utilisateur
      let apiKeyType: 'free' | 'premium' = 'free';
      
      if (isPremium || role === 'admin') {
        apiKeyType = 'premium';
        this.logger.log(`Utilisateur ${userId} (${role}, premium: ${isPremium}) - Création d'une clé API premium`);
      } else {
        this.logger.log(`Utilisateur ${userId} (${role}, premium: ${isPremium}) - Création d'une clé API free`);
      }

      // Vérifier s'il existe déjà une clé API active pour cette table
      const existingApiKey = await this.apiKeyRepository.findOne({
        where: {
        user_id: userId,
          table_name: createApiKeyDto.table_name,
          is_active: true
        }
      });

      // Si une clé existe déjà, la supprimer
      if (existingApiKey) {
        this.logger.log(`Clé API existante trouvée pour la table ${createApiKeyDto.table_name} - Suppression de l'ancienne clé: ${existingApiKey.id}`);
        await this.apiKeyRepository.remove(existingApiKey);
      }

      // Utiliser generateApiKey pour créer la clé avec les bons quotas automatiques
      const apiKey = await this.generateApiKey(
        userId,
        createApiKeyDto.table_name,
        createApiKeyDto.name,
        apiKeyType
      );

      const actionMessage = existingApiKey ? 'Clé API remplacée avec succès' : 'Clé API créée avec succès';
      this.logger.log(`${actionMessage} - ID: ${apiKey.id}, Type: ${apiKey.type}, Table: ${apiKey.table_name}`);

      return {
        success: true,
        message: actionMessage,
        data: apiKey
      };
    } catch (error) {
      this.logger.error('Erreur lors de la création de la clé API:', error);
      throw new BadRequestException('Erreur lors de la création de la clé API');
    }
  }

  /**
   * Récupère toutes les clés API d'un utilisateur avec pagination
   */
  async findAllByUser(query: any, userId: string): Promise<ApiResponse<any>> {
    console.log('🔧 [API-KEY-SERVICE] findAllByUser - Début');
    console.log('🔧 [API-KEY-SERVICE] User ID:', userId);
    console.log('🔧 [API-KEY-SERVICE] Query:', query);
    
    try {
      const { page = 1, limit = 20, table_name, type, is_active, search } = query;
      console.log('🔧 [API-KEY-SERVICE] Paramètres extraits:', { page, limit, table_name, type, is_active, search });
      
      const queryBuilder = this.apiKeyRepository.createQueryBuilder('apiKey');
      queryBuilder.where('apiKey.user_id = :userId', { userId });
      console.log('🔧 [API-KEY-SERVICE] QueryBuilder créé avec user_id =', userId);
      
      if (table_name) {
        queryBuilder.andWhere('apiKey.table_name = :table_name', { table_name });
        console.log('🔧 [API-KEY-SERVICE] Filtre table_name ajouté:', table_name);
      }
      
      if (type) {
        queryBuilder.andWhere('apiKey.type = :type', { type });
        console.log('🔧 [API-KEY-SERVICE] Filtre type ajouté:', type);
      }
      
      if (is_active !== undefined) {
        queryBuilder.andWhere('apiKey.is_active = :is_active', { is_active });
        console.log('🔧 [API-KEY-SERVICE] Filtre is_active ajouté:', is_active);
      }
      
      if (search) {
        queryBuilder.andWhere('apiKey.name ILIKE :search', { search: `%${search}%` });
        console.log('🔧 [API-KEY-SERVICE] Filtre search ajouté:', search);
      }

      const offset = (page - 1) * limit;
      queryBuilder
        .orderBy('apiKey.created_at', 'DESC')
        .skip(offset)
        .take(limit);

      console.log('🔧 [API-KEY-SERVICE] Exécution de la requête avec offset:', offset, 'et limit:', limit);
      
      const [apiKeys, total] = await queryBuilder.getManyAndCount();
      console.log('🔧 [API-KEY-SERVICE] Résultat de la requête:');
      console.log('🔧 [API-KEY-SERVICE] - Nombre de clés trouvées:', apiKeys.length);
      console.log('🔧 [API-KEY-SERVICE] - Total dans la base:', total);
      
      if (apiKeys.length > 0) {
        apiKeys.forEach((key, index) => {
          console.log(`🔧 [API-KEY-SERVICE] Clé ${index + 1}:`, {
            id: key.id,
            name: key.name,
            type: key.type,
            table_name: key.table_name,
            user_id: key.user_id,
            is_active: key.is_active,
            created_at: key.created_at
          });
        });
      } else {
        console.log('🔧 [API-KEY-SERVICE] ⚠️ Aucune clé API trouvée pour l\'utilisateur');
        
        // Vérifier si l'utilisateur existe dans la table api_keys
        const allKeysForUser = await this.apiKeyRepository.find({
          where: { user_id: userId }
        });
        console.log('🔧 [API-KEY-SERVICE] Vérification directe - Toutes les clés pour cet utilisateur:', allKeysForUser.length);
        
        if (allKeysForUser.length > 0) {
          console.log('🔧 [API-KEY-SERVICE] Clés trouvées avec find():', allKeysForUser.map(k => ({
            id: k.id,
            name: k.name,
            type: k.type,
            table_name: k.table_name,
            user_id: k.user_id,
            is_active: k.is_active
          })));
        }
      }
      
      const totalPages = Math.ceil(total / limit);
      const result = {
        success: true,
        message: 'Clés API récupérées avec succès',
        data: {
          apiKeys,
          total,
          page,
          limit,
          totalPages
        }
      };
      
      console.log('🔧 [API-KEY-SERVICE] Résultat final:', result);
      return result;
    } catch (error) {
      console.error('🔧 [API-KEY-SERVICE] ❌ Erreur dans findAllByUser:', error);
      console.error('🔧 [API-KEY-SERVICE] Stack trace:', error.stack);
      throw new BadRequestException('Erreur lors de la récupération des clés API');
    }
  }

  /**
   * Récupère une clé API d'un utilisateur spécifique
   */
  async findOneByUser(id: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const apiKey = await this.apiKeyRepository.findOne({
        where: { id, user_id: userId }
      });

      if (!apiKey) {
        throw new NotFoundException('Clé API non trouvée');
      }

      return {
        success: true,
        message: 'Clé API récupérée avec succès',
        data: apiKey
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération de la clé API');
    }
  }

  /**
   * Met à jour une clé API d'un utilisateur spécifique
   */
  async updateByUser(id: string, updateApiKeyDto: any, userId: string): Promise<ApiResponse<any>> {
    try {
      const apiKey = await this.apiKeyRepository.findOne({
        where: { id, user_id: userId }
      });

      if (!apiKey) {
        throw new NotFoundException('Clé API non trouvée');
      }

      Object.assign(apiKey, updateApiKeyDto);
      const updatedApiKey = await this.apiKeyRepository.save(apiKey);

      return {
        success: true,
        message: 'Clé API mise à jour avec succès',
        data: updatedApiKey
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour de la clé API');
    }
  }

  /**
   * Supprime une clé API d'un utilisateur spécifique
   */
  async removeByUser(id: string, userId: string): Promise<ApiResponse<null>> {
    try {
      const apiKey = await this.apiKeyRepository.findOne({
        where: { id, user_id: userId }
      });

      if (!apiKey) {
        throw new NotFoundException('Clé API non trouvée');
      }

      await this.apiKeyRepository.remove(apiKey);

      return {
        success: true,
        message: 'Clé API supprimée avec succès',
        data: null
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la suppression de la clé API');
    }
  }

  /**
   * Régénère une clé API
   */
  async regenerateKey(id: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const apiKey = await this.apiKeyRepository.findOne({
        where: { id, user_id: userId }
      });

      if (!apiKey) {
        throw new NotFoundException('Clé API non trouvée');
      }

      const newKey = `pk_${uuidv4().replace(/-/g, '')}`;
      apiKey.api_key = newKey;
      apiKey.appels_jour = 0; // Reset quota usage
      apiKey.last_used_at = new Date();

      const updatedApiKey = await this.apiKeyRepository.save(apiKey);

      return {
        success: true,
        message: 'Clé API régénérée avec succès',
        data: {
          id: updatedApiKey.id,
          key: updatedApiKey.api_key
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la régénération de la clé API');
    }
  }

  /**
   * Active ou désactive une clé API
   */
  async toggleActive(id: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const apiKey = await this.apiKeyRepository.findOne({
        where: { id, user_id: userId }
      });

      if (!apiKey) {
        throw new NotFoundException('Clé API non trouvée');
      }

      apiKey.is_active = !apiKey.is_active;
      const updatedApiKey = await this.apiKeyRepository.save(apiKey);

      return {
        success: true,
        message: `Clé API ${updatedApiKey.is_active ? 'activée' : 'désactivée'} avec succès`,
        data: updatedApiKey
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la modification du statut de la clé API');
    }
  }

  /**
   * Récupère les logs d'une clé API
   */
  async getKeyLogs(id: string, query: any, userId: string): Promise<ApiResponse<any>> {
    try {
      // Vérifier que la clé API appartient à l'utilisateur
      const apiKey = await this.apiKeyRepository.findOne({
        where: { id, user_id: userId }
      });

      if (!apiKey) {
        throw new NotFoundException('Clé API non trouvée');
      }

      const { page = 1, limit = 20, startDate, endDate } = query;
      
      const queryBuilder = this.apiLogRepository.createQueryBuilder('log');
      queryBuilder.where('log.api_key_id = :apiKeyId', { apiKeyId: id });
      
      if (startDate) {
        queryBuilder.andWhere('log.created_at >= :startDate', { startDate });
      }
      
      if (endDate) {
        queryBuilder.andWhere('log.created_at <= :endDate', { endDate });
      }

      const offset = (page - 1) * limit;
      queryBuilder
        .orderBy('log.created_at', 'DESC')
        .skip(offset)
        .take(limit);

      const [logs, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Logs récupérés avec succès',
        data: {
          logs,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération des logs');
    }
  }

  /**
   * Récupère les statistiques globales de l'API
   */
  async getGlobalStats(): Promise<any> {
    try {
      const totalApiKeys = await this.apiKeyRepository.count();
      const totalRequests = await this.apiLogRepository.count();
      const activeKeys = await this.apiKeyRepository.count({
        where: { is_active: true }
      });

      const byQuotaType = await this.apiKeyRepository
        .createQueryBuilder('apiKey')
        .select('apiKey.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('apiKey.type')
        .getRawMany();

      // Statistiques par période
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRequests = await this.apiLogRepository
        .createQueryBuilder('log')
        .where('log.created_at >= :today', { today })
        .getCount();

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekRequests = await this.apiLogRepository
        .createQueryBuilder('log')
        .where('log.created_at >= :weekAgo', { weekAgo })
        .getCount();

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const monthRequests = await this.apiLogRepository
        .createQueryBuilder('log')
        .where('log.created_at >= :monthAgo', { monthAgo })
        .getCount();

      return {
        totalApiKeys,
        totalRequests,
        activeKeys,
        byQuotaType,
        todayRequests,
        weekRequests,
        monthRequests
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des statistiques globales');
    }
  }

  /**
   * Récupère les statistiques d'utilisation détaillées
   */
  async getDetailedUsageStats(params: any): Promise<any> {
    try {
      const { period, startDate, endDate } = params;
      
      // Logique pour récupérer les statistiques détaillées
      // À implémenter selon les besoins spécifiques
      
      return {
        period,
        totalRequests: 0,
        uniqueUsers: 0,
        averageRequestsPerDay: 0,
        peakUsage: {},
        byEndpoint: [],
        byTable: [],
        byQuotaType: []
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des statistiques d\'utilisation');
    }
  }

  /**
   * Récupère les statistiques de performance
   */
  async getPerformanceStats(): Promise<any> {
    try {
      // Logique pour récupérer les statistiques de performance
      // À implémenter selon les besoins spécifiques
      
      return {
        averageResponseTime: 150,
        uptime: 99.9,
        errorRate: 0.1,
        requestsPerSecond: 25,
        cacheHitRate: 85.5,
        slowestEndpoints: [],
        mostUsedEndpoints: []
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des statistiques de performance');
    }
  }

  /**
   * Récupère les tendances d'utilisation
   */
  async getUsageTrends(days: number): Promise<any> {
    try {
      // Logique pour récupérer les tendances d'utilisation
      // À implémenter selon les besoins spécifiques
      
      return {
        period: `${days} days`,
        growth: 15.5,
        dailyRequests: [],
        newUsers: [],
        popularTables: [],
        topQueries: []
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des tendances');
    }
  }

  /**
   * Vérification de santé du service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Vérification simple de la connectivité à la base de données
      await this.apiKeyRepository.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
} 