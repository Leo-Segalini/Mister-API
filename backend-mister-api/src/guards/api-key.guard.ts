import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService } from '../services/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    try {
      const apiKey = request.headers['x-api-key'] as string;
      this.logger.debug(`🔑 ApiKeyGuard: Processing request to ${request.path}`);
      
      if (!apiKey) {
        this.logger.error('🔑 ApiKeyGuard: No API key provided');
        throw new UnauthorizedException('Clé API requise');
      }

      const tableName = this.extractTableName(request.path);
      this.logger.debug(`🔑 ApiKeyGuard: Table name extracted: ${tableName}`);

      // Valider la clé API et vérifier les permissions pour la table
      this.logger.debug(`🔑 ApiKeyGuard: Validating API key for table ${tableName}`);
      const keyData = await this.apiKeyService.validateApiKey(apiKey, tableName, request);
      request['apiKeyData'] = keyData;
      request['tableName'] = tableName;
      
      this.logger.debug(`🔑 ApiKeyGuard: API key validated successfully for ${keyData.name}`);
      
      // Vérifier le quota
      const canCall = await this.apiKeyService.checkQuota(keyData.id);
      if (!canCall) {
        this.logger.error(`🔑 ApiKeyGuard: Quota exceeded for API key ${keyData.id}`);
        throw new UnauthorizedException('Quota journalier dépassé pour cette table');
      }
      
      // Configurer le logging de l'appel
      await this.apiKeyService.logApiCall(keyData.id, request, context.switchToHttp().getResponse(), tableName);
      
      this.logger.debug(`🔑 ApiKeyGuard: Request authorized for table ${tableName}: ${keyData.name}`);
      
      return true;
    } catch (error) {
      this.logger.error(`🔑 ApiKeyGuard: Error processing request: ${error.message}`);
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