import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/api-key.service';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiKeyMiddleware.name);

  constructor(private readonly apiKeyService: ApiKeyService) {
    this.logger.debug('🔑 ApiKeyMiddleware: Initialized with ApiKeyService');
  }

  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`🔑 ApiKeyMiddleware: Processing request to ${req.path}`);
    
    try {
      const apiKey = req.headers['x-api-key'] as string;
      this.logger.debug(`🔑 ApiKeyMiddleware: API Key found: ${apiKey ? 'Yes' : 'No'}`);
      
      const tableName = this.extractTableName(req.path);
      this.logger.debug(`🔑 ApiKeyMiddleware: Table name extracted: ${tableName}`);
      
      if (!apiKey) {
        this.logger.error('🔑 ApiKeyMiddleware: No API key provided');
        throw new UnauthorizedException('Clé API requise');
      }

      // Valider la clé API et vérifier les permissions pour la table
      this.logger.debug(`🔑 ApiKeyMiddleware: Validating API key for table ${tableName}`);
      const keyData = await this.apiKeyService.validateApiKey(apiKey, tableName, req);
      req['apiKeyData'] = keyData;
      req['tableName'] = tableName;
      
      this.logger.debug(`🔑 ApiKeyMiddleware: API key validated successfully for ${keyData.name}`);
      
      // Vérifier le quota
      const canCall = await this.apiKeyService.checkQuota(keyData.id);
      if (!canCall) {
        this.logger.error(`🔑 ApiKeyMiddleware: Quota exceeded for API key ${keyData.id}`);
        throw new UnauthorizedException('Quota journalier dépassé pour cette table');
      }
      
      // Configurer le logging de l'appel
      await this.apiKeyService.logApiCall(keyData.id, req, res, tableName);
      
      this.logger.debug(`🔑 ApiKeyMiddleware: Request processed successfully for table ${tableName}: ${keyData.name}`);
      
      next();
    } catch (error) {
      this.logger.error(`🔑 ApiKeyMiddleware: Error processing request: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extrait le nom de la table depuis l'URL
   */
  private extractTableName(path: string): string {
    // Mapping des routes vers les noms de tables
    const routeToTableMap: { [key: string]: string } = {
      'punchlines': 'punchlines',
      'pays': 'pays_du_monde',
      'animaux': 'animaux',
    };

    // Extraire le premier segment de l'URL après /api/v1/
    const match = path.match(/\/api\/v1\/([^\/]+)/);
    if (!match) {
      throw new UnauthorizedException('Route invalide');
    }

    const route = match[1];
    const tableName = routeToTableMap[route];

    if (!tableName) {
      throw new UnauthorizedException(`Table non reconnue: ${route}`);
    }

    return tableName;
  }
} 