import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { ApiKeyService } from '../services/api-key.service';
import { AuthGuard } from '../guards/auth.guard';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CreateApiKeyDto, UpdateApiKeyDto, ApiKeyQueryDto } from '../dto/api-key.dto';

@ApiTags('Clés API')
@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @UseGuards(AuthGuard) // Guard individuel
  @ApiOperation({
    summary: 'Créer une nouvelle clé API',
    description: 'Crée une nouvelle clé API pour l\'utilisateur connecté. Si une clé active existe déjà pour la même table, elle sera remplacée.'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 201,
    description: 'Clé API créée ou remplacée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Clé API créée avec succès' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            api_key: { type: 'string' },
            table_name: { type: 'string' },
            type: { type: 'string', enum: ['free', 'premium'] },
            appels_jour: { type: 'number' },
            appels_minute: { type: 'number' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string' }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async create(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.create(createApiKeyDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard) // Guard individuel
  @ApiOperation({
    summary: 'Récupérer les clés API de l\'utilisateur',
    description: 'Récupère toutes les clés API de l\'utilisateur connecté'
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'table_name', required: false, type: String, description: 'Filtrer par table' })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, description: 'Filtrer par statut actif' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Clés API récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Clés API récupérées avec succès' },
        data: {
          type: 'object',
          properties: {
            apiKeys: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 5 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async findAll(
    @Query() query: ApiKeyQueryDto,
    @Req() req: AuthenticatedRequest
  ) {
    // console.log('🔍 [API-KEY-CONTROLLER] findAll - Début de la requête');
    // console.log('🔍 [API-KEY-CONTROLLER] User ID:', req.user?.id);
    // console.log('🔍 [API-KEY-CONTROLLER] Query params:', query);
    
    if (!req.user?.id) {
      console.error('🔍 [API-KEY-CONTROLLER] ❌ Utilisateur non authentifié');
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    try {
      // console.log('🔍 [API-KEY-CONTROLLER] Appel du service findAllByUser');
      const result = await this.apiKeyService.findAllByUser(query, req.user.id);
      // console.log('🔍 [API-KEY-CONTROLLER] Résultat du service:', result);
      // console.log('🔍 [API-KEY-CONTROLLER] Type de result.data:', typeof result.data);
      // console.log('🔍 [API-KEY-CONTROLLER] Structure de result.data:', result.data);
      
      if (result.data && result.data.apiKeys) {
        // console.log('🔍 [API-KEY-CONTROLLER] Nombre de clés API trouvées:', result.data.apiKeys.length);
        result.data.apiKeys.forEach((key: any, index: number) => {
          // console.log(`🔍 [API-KEY-CONTROLLER] Clé ${index + 1}:`, {
          //   id: key.id,
          //   name: key.name,
          //   type: key.type,
          //   table_name: key.table_name,
          //   user_id: key.user_id,
          //   is_active: key.is_active,
          //   created_at: key.created_at
          // });
        });
      } else {
        // console.log('🔍 [API-KEY-CONTROLLER] ⚠️ Aucune clé API trouvée ou structure inattendue');
      }
      
      return result;
    } catch (error) {
      console.error('🔍 [API-KEY-CONTROLLER] ❌ Erreur dans findAll:', error);
      console.error('🔍 [API-KEY-CONTROLLER] Détails de l\'erreur:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  @Get(':id/stats')
  @UseGuards(SupabaseAuthGuard) // Utiliser SupabaseAuthGuard pour les Bearer tokens
  @ApiOperation({
    summary: 'Récupérer les statistiques d\'utilisation d\'une clé API',
    description: 'Récupère les statistiques détaillées d\'utilisation d\'une clé API spécifique'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statistiques récupérées avec succès' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            api_key_name: { type: 'string', example: 'Animaux' },
            user_id: { type: 'string', example: 'uuid' },
            user_email: { type: 'string', example: 'user@example.com' },
            total_requests: { type: 'number', example: 2 },
            successful_requests: { type: 'number', example: 2 },
            failed_requests: { type: 'number', example: 0 },
            average_response_time: { type: 'number', example: 452.5 },
            last_request_at: { type: 'string', example: '2025-07-10T08:21:14.205653Z' },
            calls_today: { type: 'number', example: 2 },
            total_calls: { type: 'number', example: 2 }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Clé API non trouvée'
  })
  async getApiKeyStats(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.getApiKeyUsageStats(id, req.user.id);
  }

  @Get('stats')
  @UseGuards(SupabaseAuthGuard) // Utiliser SupabaseAuthGuard pour les Bearer tokens
  @ApiOperation({
    summary: 'Récupérer les statistiques des clés API',
    description: 'Récupère les statistiques d\'utilisation des clés API de l\'utilisateur'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statistiques récupérées avec succès' },
        data: {
          type: 'object',
          properties: {
            totalKeys: { type: 'number', example: 5 },
            activeKeys: { type: 'number', example: 3 },
            totalUsage: { type: 'number', example: 1250 },
            byTable: { type: 'array', items: { type: 'object' } },
            byQuotaType: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  async getStats(@Req() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.getUserStats(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard) // Guard individuel
  @ApiOperation({
    summary: 'Récupérer une clé API par ID',
    description: 'Récupère une clé API spécifique de l\'utilisateur connecté'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Clé API récupérée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Clé API récupérée avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Clé API non trouvée'
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.findOneByUser(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard) // Guard individuel
  @ApiOperation({
    summary: 'Mettre à jour une clé API',
    description: 'Met à jour une clé API de l\'utilisateur connecté'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Clé API mise à jour avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Clé API mise à jour avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Clé API non trouvée'
  })
  async update(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.updateByUser(id, updateApiKeyDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard) // Guard individuel
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une clé API',
    description: 'Supprime une clé API de l\'utilisateur connecté'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({
    status: 204,
    description: 'Clé API supprimée avec succès'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Clé API non trouvée'
  })
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<null>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.removeByUser(id, req.user.id);
  }

  @Post(':id/regenerate')
  @UseGuards(AuthGuard) // Guard individuel
  @ApiOperation({
    summary: 'Régénérer une clé API',
    description: 'Génère une nouvelle clé pour une clé API existante'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Clé API régénérée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Clé API régénérée avec succès' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            key: { type: 'string' }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Clé API non trouvée'
  })
  async regenerate(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.regenerateKey(id, req.user.id);
  }

  @Post(':id/toggle')
  @UseGuards(AuthGuard) // Guard individuel
  @ApiOperation({
    summary: 'Activer/Désactiver une clé API',
    description: 'Active ou désactive une clé API'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Statut de la clé API modifié avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statut de la clé API modifié avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Clé API non trouvée'
  })
  async toggle(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.toggleActive(id, req.user.id);
  }

  @Get(':id/logs')
  @UseGuards(AuthGuard) // Guard individuel
  @ApiOperation({
    summary: 'Récupérer les logs d\'une clé API',
    description: 'Récupère l\'historique d\'utilisation d\'une clé API'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'Date de fin (YYYY-MM-DD)' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Logs récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Logs récupérés avec succès' },
        data: {
          type: 'object',
          properties: {
            logs: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Clé API non trouvée'
  })
  async getLogs(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.apiKeyService.getKeyLogs(id, { page, limit, startDate, endDate }, req.user.id);
  }

  /**
   * Obtient les statistiques de sécurité pour une clé API
   */
  @Get(':id/security-stats')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtenir les statistiques de sécurité d\'une clé API' })
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({ status: 200, description: 'Statistiques de sécurité récupérées' })
  async getSecurityStats(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return await this.apiKeyService.getSecurityStats(id);
  }

  /**
   * Configure les options de sécurité pour une clé API
   */
  @Put(':id/security')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Configurer les options de sécurité d\'une clé API' })
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        allowedIps: { type: 'array', items: { type: 'string' } },
        maxIps: { type: 'number' },
        autoRotate: { type: 'boolean' },
        rotationDays: { type: 'number' },
      }
    }
  })
  @SwaggerApiResponse({ status: 200, description: 'Options de sécurité mises à jour' })
  async configureSecurity(
    @Param('id') id: string,
    @Body() securityConfig: {
      allowedIps?: string[];
      maxIps?: number;
      autoRotate?: boolean;
      rotationDays?: number;
    },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    const updates: any = {};
    
    if (securityConfig.allowedIps !== undefined) {
      updates.allowed_ips = securityConfig.allowedIps;
    }
    if (securityConfig.maxIps !== undefined) {
      updates.max_ips = securityConfig.maxIps;
    }
    if (securityConfig.autoRotate !== undefined) {
      updates.auto_rotate = securityConfig.autoRotate;
    }
    if (securityConfig.rotationDays !== undefined) {
      updates.rotation_days = securityConfig.rotationDays;
    }

    return await this.apiKeyService.updateByUser(id, updates, req.user.id);
  }

  /**
   * Force la rotation d'une clé API
   */
  @Post(':id/rotate')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Forcer la rotation d\'une clé API' })
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({ status: 200, description: 'Clé API renouvelée' })
  async forceRotate(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    // Récupérer la clé actuelle
    const currentKey = await this.apiKeyService.findOneByUser(id, req.user.id);
    
    // Générer une nouvelle clé avec les mêmes paramètres
    const newKey = await this.apiKeyService.generateApiKey(
      req.user.id,
      currentKey.data.table_name,
      `${currentKey.data.name} (rotation forcée)`,
      currentKey.data.type
    );

    // Désactiver l'ancienne clé
    await this.apiKeyService.updateByUser(id, {
      is_active: false,
    }, req.user.id);

    return {
      success: true,
      message: 'Clé API renouvelée avec succès',
      data: newKey
    };
  }
} 