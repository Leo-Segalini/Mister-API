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
import { AnimalService } from '../services/animal.service';
import { CreateAnimalDto, UpdateAnimalDto, AnimalQueryDto } from '../dto/animal.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Animal } from '../entities/animal.entity';

@ApiTags('Animaux')
@Controller('animaux')
@UseGuards(ApiKeyGuard)
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Créer un nouvel animal',
    description: 'Crée un nouvel animal avec authentification requise'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 201,
    description: 'Animal créé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Animal créé avec succès' },
        data: { $ref: '#/components/schemas/Animal' }
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
  async create(@Body() createAnimalDto: CreateAnimalDto): Promise<ApiResponse<Animal>> {
    return this.animalService.create(createAnimalDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les animaux',
    description: 'Récupère une liste paginée des animaux avec filtres et recherche'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par nom, espèce ou famille' })
  @ApiQuery({ name: 'famille', required: false, type: String, description: 'Filtrer par famille' })
  @ApiQuery({ name: 'habitat', required: false, type: String, description: 'Filtrer par habitat' })
  @ApiQuery({ name: 'alimentation', required: false, type: String, description: 'Filtrer par alimentation' })
  @ApiQuery({ name: 'zone', required: false, type: String, description: 'Filtrer par zone géographique' })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, description: 'Filtrer les animaux actifs' })
  @ApiQuery({ name: 'taille_min', required: false, type: Number, description: 'Taille minimum en m' })
  @ApiQuery({ name: 'taille_max', required: false, type: Number, description: 'Taille maximum en m' })
  @ApiQuery({ name: 'poids_min', required: false, type: Number, description: 'Poids minimum en kg' })
  @ApiQuery({ name: 'poids_max', required: false, type: Number, description: 'Poids maximum en kg' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Animaux récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Animaux récupérés avec succès' },
        data: {
          type: 'object',
          properties: {
            animaux: { type: 'array', items: { $ref: '#/components/schemas/Animal' } },
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
  async findAll(@Query() query: AnimalQueryDto) {
    return this.animalService.findAll(query);
  }

  @Get('famille/:famille')
  @ApiOperation({
    summary: 'Récupérer les animaux par famille',
    description: 'Récupère tous les animaux d\'une famille spécifique'
  })
  @ApiParam({ name: 'famille', description: 'Famille d\'animaux' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Animaux récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Animaux de la famille Delphinidés récupérés avec succès' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Animal' } }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Famille invalide'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findByFamille(@Param('famille') famille: string) {
    return this.animalService.findByFamille(famille);
  }

  @Get('actifs')
  @ApiOperation({
    summary: 'Récupérer les animaux actifs',
    description: 'Récupère tous les animaux actifs'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Animaux actifs récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Animaux actifs récupérés avec succès' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Animal' } }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getActiveAnimals() {
    return this.animalService.getActiveAnimals();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Récupérer les statistiques des animaux',
    description: 'Récupère les statistiques globales des animaux'
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
            total: { type: 'number', example: 500 },
            activeCount: { type: 'number', example: 450 },
            byFamille: { type: 'array', items: { type: 'object' } },
            byHabitat: { type: 'array', items: { type: 'object' } },
            byAlimentation: { type: 'array', items: { type: 'object' } },
            averageTaille: { type: 'number', example: 1.5 },
            averagePoids: { type: 'number', example: 75.2 }
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
    return this.animalService.getStats();
  }

  @Get('espece/:espece')
  @ApiOperation({
    summary: 'Récupérer un animal par espèce',
    description: 'Récupère un animal spécifique par son nom scientifique (espèce)'
  })
  @ApiParam({ name: 'espece', description: 'Nom scientifique de l\'animal' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Animal récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Animal récupéré avec succès' },
        data: { $ref: '#/components/schemas/Animal' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Animal non trouvé'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findByEspece(@Param('espece') espece: string): Promise<ApiResponse<Animal>> {
    return this.animalService.findByEspece(espece);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer un animal par ID',
    description: 'Récupère un animal spécifique par son ID'
  })
  @ApiParam({ name: 'id', description: 'ID de l\'animal' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Animal récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Animal récupéré avec succès' },
        data: { $ref: '#/components/schemas/Animal' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Animal non trouvé'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findOne(@Param('id') id: string): Promise<ApiResponse<Animal>> {
    return this.animalService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mettre à jour un animal',
    description: 'Met à jour un animal existant avec authentification requise'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de l\'animal' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Animal mis à jour avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Animal mis à jour avec succès' },
        data: { $ref: '#/components/schemas/Animal' }
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
    description: 'Animal non trouvé'
  })
  async update(
    @Param('id') id: string,
    @Body() updateAnimalDto: UpdateAnimalDto
  ): Promise<ApiResponse<Animal>> {
    return this.animalService.update(id, updateAnimalDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un animal',
    description: 'Supprime un animal avec authentification requise'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de l\'animal' })
  @SwaggerApiResponse({
    status: 204,
    description: 'Animal supprimé avec succès'
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
    description: 'Animal non trouvé'
  })
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    return this.animalService.remove(id);
  }
} 