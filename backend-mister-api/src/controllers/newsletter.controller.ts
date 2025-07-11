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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NewsletterService } from '../services/newsletter.service';
import { CreateNewsletterSubscriptionDto, UpdateNewsletterSubscriptionDto, NewsletterQueryDto, ConfirmNewsletterDto, UnsubscribeNewsletterDto } from '../dto/newsletter.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiResponse } from '../interfaces/api-response.interface';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({
    summary: 'S\'abonner à la newsletter',
    description: 'Crée un nouvel abonnement à la newsletter avec confirmation par email'
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Abonnement créé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abonnement à la newsletter créé. Vérifiez votre email pour confirmer.' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides'
  })
  async subscribe(@Body() createDto: CreateNewsletterSubscriptionDto): Promise<ApiResponse<any>> {
    return this.newsletterService.createSubscription(createDto);
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirmer un abonnement à la newsletter',
    description: 'Confirme un abonnement à la newsletter avec le token reçu par email'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Abonnement confirmé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abonnement à la newsletter confirmé avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Token invalide ou expiré'
  })
  async confirm(@Body() confirmDto: ConfirmNewsletterDto): Promise<ApiResponse<any>> {
    return this.newsletterService.confirmSubscription(confirmDto.token);
  }

  @Post('unsubscribe')
  @ApiOperation({
    summary: 'Se désabonner de la newsletter',
    description: 'Désabonne un utilisateur de la newsletter avec le token de désabonnement'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Désabonnement effectué avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Désabonnement effectué avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Token invalide'
  })
  async unsubscribe(@Body() unsubscribeDto: UnsubscribeNewsletterDto): Promise<ApiResponse<any>> {
    return this.newsletterService.unsubscribe(unsubscribeDto.token);
  }

  @Get()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Récupérer tous les abonnements à la newsletter',
    description: 'Récupère une liste paginée des abonnements avec filtres (Admin uniquement)'
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par email ou nom' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'source', required: false, type: String, description: 'Filtrer par source' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Abonnements récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abonnements récupérés avec succès' },
        data: {
          type: 'object',
          properties: {
            subscriptions: { type: 'array', items: { type: 'object' } },
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
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findAll(@Query() query: NewsletterQueryDto): Promise<ApiResponse<any>> {
    return this.newsletterService.findAll(query);
  }

  @Get('stats')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Récupérer les statistiques de la newsletter',
    description: 'Récupère les statistiques globales des abonnements (Admin uniquement)'
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
            totalSubscribers: { type: 'number', example: 500 },
            pendingSubscribers: { type: 'number', example: 10 },
            todaySubscribers: { type: 'number', example: 5 },
            statsByStatus: { type: 'array', items: { type: 'object' } },
            statsBySource: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getStats(): Promise<ApiResponse<any>> {
    return this.newsletterService.getStats();
  }

  @Get(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Récupérer un abonnement par ID',
    description: 'Récupère un abonnement spécifique par son ID (Admin uniquement)'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de l\'abonnement' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Abonnement récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abonnement récupéré avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Abonnement non trouvé'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findOne(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.newsletterService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Mettre à jour un abonnement',
    description: 'Met à jour un abonnement existant (Admin uniquement)'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de l\'abonnement' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Abonnement mis à jour avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abonnement mis à jour avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Abonnement non trouvé'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNewsletterSubscriptionDto
  ): Promise<ApiResponse<any>> {
    return this.newsletterService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Supprimer un abonnement',
    description: 'Supprime définitivement un abonnement (Admin uniquement)'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de l\'abonnement' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Abonnement supprimé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abonnement supprimé avec succès' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Abonnement non trouvé'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    return this.newsletterService.remove(id);
  }

  @Post('send')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Envoyer une newsletter',
    description: 'Envoie une newsletter à tous les abonnés actifs (Admin uniquement)'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Newsletter envoyée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Newsletter envoyée à 500 abonnés (0 échecs)' },
        data: {
          type: 'object',
          properties: {
            success: { type: 'number', example: 500 },
            failed: { type: 'number', example: 0 }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async sendNewsletter(
    @Body() data: { subject: string; content: string }
  ): Promise<ApiResponse<any>> {
    return this.newsletterService.sendNewsletter(data.subject, data.content);
  }

  @Post('cleanup')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Nettoyer les tokens expirés',
    description: 'Supprime les abonnements en attente de plus de 7 jours (Admin uniquement)'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 200,
    description: 'Nettoyage effectué avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '10 abonnements expirés supprimés' },
        data: {
          type: 'object',
          properties: {
            deletedCount: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async cleanupExpiredTokens(): Promise<ApiResponse<any>> {
    return this.newsletterService.cleanupExpiredTokens();
  }
} 