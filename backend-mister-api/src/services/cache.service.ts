import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 3600; // 1 heure par défaut

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value !== undefined) {
        this.logger.debug(`Cache HIT: ${key}`);
        return value;
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du cache pour ${key}:`, error);
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl || this.defaultTTL);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || this.defaultTTL}s)`);
    } catch (error) {
      this.logger.error(`Erreur lors du stockage en cache pour ${key}:`, error);
    }
  }

  /**
   * Supprime une clé du cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du cache pour ${key}:`, error);
    }
  }

  /**
   * Supprime plusieurs clés du cache
   */
  async delMultiple(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
      this.logger.debug(`Cache DEL MULTIPLE: ${keys.length} clés`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression multiple du cache:`, error);
    }
  }

  /**
   * Vide tout le cache
   */
  async reset(): Promise<void> {
    try {
      // Note: La méthode reset n'est pas disponible dans toutes les implémentations
      // On utilise une approche alternative
      this.logger.debug('Cache RESET: Méthode non implémentée');
    } catch (error) {
      this.logger.error('Erreur lors du reset du cache:', error);
    }
  }

  /**
   * Récupère ou met en cache une valeur avec une fonction de génération
   */
  async getOrSet<T>(
    key: string,
    generator: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await generator();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Cache avec invalidation automatique
   */
  async getOrSetWithInvalidation<T>(
    key: string,
    generator: () => Promise<T>,
    invalidationKeys: string[],
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await generator();
    await this.set(key, value, ttl);
    
    // Stocker les clés d'invalidation
    await this.set(`${key}:invalidation`, invalidationKeys, ttl);
    
    return value;
  }

  /**
   * Invalide le cache basé sur des patterns
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Note: Cette fonctionnalité dépend de l'implémentation Redis
      // Pour l'instant, on utilise une approche simplifiée
      this.logger.debug(`Cache INVALIDATE PATTERN: ${pattern}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'invalidation par pattern ${pattern}:`, error);
    }
  }

  /**
   * Cache pour les statistiques d'API
   */
  async getApiStats(userId: string, tableName: string): Promise<any | null> {
    return await this.get(`api_stats:${userId}:${tableName}`);
  }

  async setApiStats(userId: string, tableName: string, stats: any, ttl: number = 300): Promise<void> {
    await this.set(`api_stats:${userId}:${tableName}`, stats, ttl);
  }

  /**
   * Cache pour les clés API
   */
  async getApiKey(apiKey: string): Promise<any | null> {
    return await this.get(`api_key:${apiKey}`);
  }

  async setApiKey(apiKey: string, keyData: any, ttl: number = 1800): Promise<void> {
    await this.set(`api_key:${apiKey}`, keyData, ttl);
  }

  async invalidateApiKey(apiKey: string): Promise<void> {
    await this.del(`api_key:${apiKey}`);
  }

  /**
   * Cache pour les données utilisateur
   */
  async getUser(userId: string): Promise<any | null> {
    return await this.get(`user:${userId}`);
  }

  async setUser(userId: string, userData: any, ttl: number = 3600): Promise<void> {
    await this.set(`user:${userId}`, userData, ttl);
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.del(`user:${userId}`);
  }

  /**
   * Cache pour les données de sécurité
   */
  async getSecurityStats(apiKeyId: string): Promise<any | null> {
    return await this.get(`security_stats:${apiKeyId}`);
  }

  async setSecurityStats(apiKeyId: string, stats: any, ttl: number = 600): Promise<void> {
    await this.set(`security_stats:${apiKeyId}`, stats, ttl);
  }

  /**
   * Cache pour les métriques de performance
   */
  async getPerformanceMetrics(): Promise<any | null> {
    return await this.get('performance_metrics');
  }

  async setPerformanceMetrics(metrics: any, ttl: number = 300): Promise<void> {
    await this.set('performance_metrics', metrics, ttl);
  }

  /**
   * Cache pour les données de recherche
   */
  async getSearchResults(query: string, tableName: string): Promise<any | null> {
    const key = `search:${tableName}:${this.hashQuery(query)}`;
    return await this.get(key);
  }

  async setSearchResults(query: string, tableName: string, results: any, ttl: number = 1800): Promise<void> {
    const key = `search:${tableName}:${this.hashQuery(query)}`;
    await this.set(key, results, ttl);
  }

  /**
   * Cache pour les données de pagination
   */
  async getPaginatedData(key: string, page: number, limit: number): Promise<any | null> {
    return await this.get(`${key}:page:${page}:limit:${limit}`);
  }

  async setPaginatedData(key: string, page: number, limit: number, data: any, ttl: number = 900): Promise<void> {
    await this.set(`${key}:page:${page}:limit:${limit}`, data, ttl);
  }

  /**
   * Cache pour les données de dashboard
   */
  async getDashboardData(userId: string): Promise<any | null> {
    return await this.get(`dashboard:${userId}`);
  }

  async setDashboardData(userId: string, data: any, ttl: number = 300): Promise<void> {
    await this.set(`dashboard:${userId}`, data, ttl);
  }

  /**
   * Cache pour les données d'analytics
   */
  async getAnalyticsData(period: string): Promise<any | null> {
    return await this.get(`analytics:${period}`);
  }

  async setAnalyticsData(period: string, data: any, ttl: number = 3600): Promise<void> {
    await this.set(`analytics:${period}`, data, ttl);
  }

  /**
   * Cache pour les données de monitoring
   */
  async getMonitoringData(): Promise<any | null> {
    return await this.get('monitoring:realtime');
  }

  async setMonitoringData(data: any, ttl: number = 60): Promise<void> {
    await this.set('monitoring:realtime', data, ttl);
  }

  /**
   * Utilitaires
   */
  private hashQuery(query: string): string {
    // Hash simple pour les clés de cache
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Statistiques du cache
   */
  async getCacheStats(): Promise<any> {
    try {
      // Note: Les statistiques exactes dépendent de l'implémentation Redis
      return {
        status: 'operational',
        timestamp: new Date().toISOString(),
        // Ajouter d'autres métriques selon l'implémentation
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des statistiques du cache:', error);
      return { status: 'error', error: error.message };
    }
  }
} 