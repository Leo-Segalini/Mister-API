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
import { PunchlineService } from '../services/punchline.service';
import { CreatePunchlineDto, UpdatePunchlineDto, PunchlineQueryDto, PunchlineTheme, PunchlineLangue } from '../dto/punchline.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Punchline } from '../entities/punchline.entity';

@ApiTags('Citations Historiques')
@Controller('punchlines')
@UseGuards(ApiKeyGuard)
export class PunchlineController {
  constructor(private readonly punchlineService: PunchlineService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Créer une nouvelle citation historique',
    description: 'Crée une nouvelle citation historique avec authentification requise'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 201,
    description: 'Citation historique créée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Citation historique créée avec succès' },
        data: { $ref: '#/components/schemas/Punchline' }
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
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async create(@Body() createPunchlineDto: CreatePunchlineDto): Promise<ApiResponse<Punchline>> {
    return this.punchlineService.create(createPunchlineDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer toutes les citations historiques',
    description: 'Récupère une liste paginée des citations historiques avec filtres et recherche'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par texte, auteur ou thème' })
  @ApiQuery({ name: 'theme', required: false, enum: PunchlineTheme, description: 'Filtrer par thème' })
  @ApiQuery({ name: 'langue', required: false, enum: PunchlineLangue, description: 'Filtrer par origine géographique' })
  @ApiQuery({ name: 'auteur', required: false, type: String, description: 'Filtrer par auteur' })
  @ApiQuery({ name: 'tags', required: false, type: String, description: 'Filtrer par tags (séparés par des virgules)' })
  @ApiQuery({ name: 'annee', required: false, type: Number, description: 'Filtrer par année' })
  @ApiQuery({ name: 'annee_range', required: false, type: String, description: 'Filtrer par période (ex: 1600-1700)' })
  @ApiQuery({ name: 'popularite_min', required: false, type: Number, description: 'Popularité minimum (0-100)' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Citations historiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Citations historiques récupérées avec succès' },
        data: {
          type: 'object',
          properties: {
            punchlines: { type: 'array', items: { $ref: '#/components/schemas/Punchline' } },
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
    status: 400,
    description: 'Paramètres de requête invalides'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findAll(@Query() query: PunchlineQueryDto) {
    return this.punchlineService.findAll(query);
  }

  @Get('random')
  @ApiOperation({
    summary: 'Récupérer une citation historique aléatoire',
    description: 'Récupère une citation historique aléatoire avec filtres optionnels'
  })
  @ApiQuery({ name: 'theme', required: false, enum: PunchlineTheme, description: 'Filtrer par thème' })
  @ApiQuery({ name: 'langue', required: false, enum: PunchlineLangue, description: 'Filtrer par origine géographique' })
  @ApiQuery({ name: 'popularite_min', required: false, type: Number, description: 'Popularité minimum' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Citation historique aléatoire récupérée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Citation historique aléatoire récupérée avec succès' },
        data: { $ref: '#/components/schemas/Punchline' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Aucune citation historique trouvée avec les critères spécifiés'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getRandom(
    @Query('theme') theme?: PunchlineTheme,
    @Query('langue') langue?: PunchlineLangue,
    @Query('popularite_min') popularite_min?: number
  ) {
    return this.punchlineService.getRandom({ theme, langue, popularite_min });
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Récupérer les statistiques des citations historiques',
    description: 'Récupère les statistiques globales des citations historiques'
  })
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
            total: { type: 'number', example: 1000 },
            byTheme: { type: 'array', items: { type: 'object' } },
            byLangue: { type: 'array', items: { type: 'object' } },
            averagePopularite: { type: 'number', example: 85.5 }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getStats() {
    return this.punchlineService.getStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer une citation historique par ID',
    description: 'Récupère une citation historique spécifique par son ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la citation historique' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Citation historique récupérée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Citation historique récupérée avec succès' },
        data: { $ref: '#/components/schemas/Punchline' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Citation historique non trouvée'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findOne(@Param('id') id: string): Promise<ApiResponse<Punchline>> {
    return this.punchlineService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mettre à jour une citation historique',
    description: 'Met à jour une citation historique existante avec authentification requise'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la citation historique' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Citation historique mise à jour avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Citation historique mise à jour avec succès' },
        data: { $ref: '#/components/schemas/Punchline' }
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
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Citation historique non trouvée'
  })
  async update(
    @Param('id') id: string,
    @Body() updatePunchlineDto: UpdatePunchlineDto
  ): Promise<ApiResponse<Punchline>> {
    return this.punchlineService.update(id, updatePunchlineDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une citation historique',
    description: 'Supprime une citation historique avec authentification requise'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la citation historique' })
  @SwaggerApiResponse({
    status: 204,
    description: 'Citation historique supprimée avec succès'
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Citation historique non trouvée'
  })
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    return this.punchlineService.remove(id);
  }
} 