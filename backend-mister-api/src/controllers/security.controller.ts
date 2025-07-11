import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { ApiKeyService } from '../services/api-key.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiResponse } from '../interfaces/api-response.interface';

@ApiTags('Sécurité')
@Controller('security')
@UseGuards(AuthGuard)
export class SecurityController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * Obtient les statistiques de sécurité globales
   */
  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de sécurité globales' })
  @ApiBearerAuth()
  @SwaggerApiResponse({ status: 200, description: 'Statistiques de sécurité récupérées' })
  async getGlobalSecurityStats(@Req() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    return await this.apiKeyService.getGlobalStats();
  }

  /**
   * Obtient les statistiques de sécurité détaillées
   */
  @Get('detailed-stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de sécurité détaillées' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Date de fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'tableName', required: false, type: String, description: 'Filtrer par table' })
  @SwaggerApiResponse({ status: 200, description: 'Statistiques détaillées récupérées' })
  async getDetailedSecurityStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tableName') tableName?: string,
    @Req() req?: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (req && !req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    const params = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      tableName,
    };
    
    return await this.apiKeyService.getDetailedUsageStats(params);
  }

  /**
   * Obtient les tendances d'utilisation
   */
  @Get('usage-trends')
  @ApiOperation({ summary: 'Obtenir les tendances d\'utilisation' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Nombre de jours (défaut: 30)' })
  @SwaggerApiResponse({ status: 200, description: 'Tendances d\'utilisation récupérées' })
  async getUsageTrends(
    @Query('days') days: number = 30,
    @Req() req?: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (req && !req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    return await this.apiKeyService.getUsageTrends(days);
  }

  /**
   * Obtient les statistiques de performance
   */
  @Get('performance-stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de performance' })
  @ApiBearerAuth()
  @SwaggerApiResponse({ status: 200, description: 'Statistiques de performance récupérées' })
  async getPerformanceStats(@Req() req?: AuthenticatedRequest): Promise<ApiResponse<any>> {
    if (req && !req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    return await this.apiKeyService.getPerformanceStats();
  }

  /**
   * Force la rotation de toutes les clés API expirées
   */
  @Post('rotate-expired-keys')
  @ApiOperation({ summary: 'Forcer la rotation de toutes les clés API expirées' })
  @ApiBearerAuth()
  @SwaggerApiResponse({ status: 200, description: 'Rotation des clés expirées terminée' })
  async forceRotateExpiredKeys(@Req() req?: AuthenticatedRequest): Promise<ApiResponse<any>> {
    if (req && !req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    await this.apiKeyService.rotateExpiredKeys();
    
    return {
      success: true,
      message: 'Rotation des clés API expirées terminée avec succès',
      data: null
    };
  }

  /**
   * Obtient les alertes de sécurité
   */
  @Get('alerts')
  @ApiOperation({ summary: 'Obtenir les alertes de sécurité récentes' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'alertes (défaut: 50)' })
  @SwaggerApiResponse({ status: 200, description: 'Alertes de sécurité récupérées' })
  async getSecurityAlerts(
    @Query('limit') limit: number = 50,
    @Req() req?: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (req && !req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    // Récupérer les logs d'activités suspectes
    const suspiciousLogs = await this.apiKeyService.getSuspiciousActivities(limit);
    
    return {
      success: true,
      message: 'Alertes de sécurité récupérées avec succès',
      data: suspiciousLogs
    };
  }

  /**
   * Vérifie l'état de santé du système de sécurité
   */
  @Get('health')
  @ApiOperation({ summary: 'Vérifier l\'état de santé du système de sécurité' })
  @ApiBearerAuth()
  @SwaggerApiResponse({ status: 200, description: 'État de santé récupéré' })
  async getSecurityHealth(@Req() req?: AuthenticatedRequest): Promise<ApiResponse<any>> {
    if (req && !req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    const healthStatus = await this.apiKeyService.healthCheck();
    
    return {
      success: true,
      message: 'État de santé du système de sécurité récupéré',
      data: {
        status: healthStatus ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          apiKeyValidation: 'operational',
          securityMonitoring: 'operational',
          automaticRotation: 'operational',
        }
      }
    };
  }
} 