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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaysDuMondeService } from '../services/pays-du-monde.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { AuthGuard } from '../guards/auth.guard';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CreatePaysDuMondeDto, UpdatePaysDuMondeDto, PaysDuMondeQueryDto } from '../dto/pays-du-monde.dto';
import { Pays } from '../entities/pays.entity';

@ApiTags('Pays du Monde')
@Controller('pays')
@UseGuards(ApiKeyGuard)
export class PaysDuMondeController {
  constructor(private readonly paysDuMondeService: PaysDuMondeService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Créer un nouveau pays',
    description: 'Crée un nouveau pays dans la base de données (nécessite une authentification)'
  })
  @ApiBearerAuth()
  @SwaggerApiResponse({
    status: 201,
    description: 'Pays créé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays créé avec succès' },
        data: { $ref: '#/components/schemas/Pays' }
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
  async create(@Body() createPaysDuMondeDto: CreatePaysDuMondeDto): Promise<ApiResponse<Pays>> {
    return this.paysDuMondeService.create(createPaysDuMondeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les pays',
    description: 'Récupère une liste paginée de tous les pays avec filtres et tri'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page', example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par nom, capitale ou continent' })
  @ApiQuery({ name: 'continent', required: false, type: String, description: 'Filtrer par continent' })
  @ApiQuery({ name: 'population_min', required: false, type: Number, description: 'Population minimum' })
  @ApiQuery({ name: 'population_max', required: false, type: Number, description: 'Population maximum' })
  @ApiQuery({ name: 'superficie_min', required: false, type: Number, description: 'Superficie minimum' })
  @ApiQuery({ name: 'superficie_max', required: false, type: Number, description: 'Superficie maximum' })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, description: 'Filtrer les pays actifs' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['nom', 'population', 'superficie', 'continent'], description: 'Champ de tri' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays récupérés avec succès' },
        data: {
          type: 'object',
          properties: {
            pays: { type: 'array', items: { $ref: '#/components/schemas/Pays' } },
            total: { type: 'number', example: 195 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 10 }
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
  async findAll(@Query() query: PaysDuMondeQueryDto) {
    return this.paysDuMondeService.findAll(query);
  }

  @Get('continent/:continent')
  @ApiOperation({
    summary: 'Récupérer les pays par continent',
    description: 'Récupère tous les pays d\'un continent spécifique'
  })
  @ApiParam({ name: 'continent', description: 'Nom du continent', example: 'Europe' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays du continent récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays du continent récupérés avec succès' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Pays' } }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getCountriesByContinent(@Param('continent') continent: string): Promise<ApiResponse<Pays[]>> {
    return this.paysDuMondeService.getCountriesByContinent(continent);
  }

  @Get('actifs')
  @ApiOperation({
    summary: 'Récupérer les pays actifs',
    description: 'Récupère tous les pays actifs'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays actifs récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays actifs récupérés avec succès' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Pays' } }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getActiveCountries(): Promise<ApiResponse<Pays[]>> {
    return this.paysDuMondeService.getActiveCountries();
  }

  @Get('population/:range')
  @ApiOperation({
    summary: 'Récupérer les pays par tranche de population',
    description: 'Récupère les pays selon leur population (petit, moyen, grand, très grand)'
  })
  @ApiParam({ name: 'range', description: 'Tranche de population', example: 'grand' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays récupérés avec succès' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Pays' } }
      }
    }
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Tranche de population invalide'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getCountriesByPopulation(@Param('range') range: string): Promise<ApiResponse<Pays[]>> {
    return this.paysDuMondeService.getCountriesByPopulation(range);
  }

  @Get('capitale/:capitale')
  @ApiOperation({
    summary: 'Rechercher un pays par sa capitale',
    description: 'Récupère un pays en recherchant par le nom de sa capitale'
  })
  @ApiParam({ name: 'capitale', description: 'Nom de la capitale', example: 'Paris' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays trouvé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays trouvé avec succès' },
        data: { $ref: '#/components/schemas/Pays' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Pays non trouvé'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findByCapitale(@Param('capitale') capitale: string): Promise<ApiResponse<Pays>> {
    return this.paysDuMondeService.findByCapitale(capitale);
  }

  @Get('monnaie/:monnaie')
  @ApiOperation({
    summary: 'Récupérer les pays par monnaie',
    description: 'Récupère tous les pays utilisant une monnaie spécifique'
  })
  @ApiParam({ name: 'monnaie', description: 'Nom de la monnaie', example: 'Euro' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays récupérés avec succès' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Pays' } }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getCountriesByCurrency(@Param('monnaie') monnaie: string): Promise<ApiResponse<Pays[]>> {
    return this.paysDuMondeService.getCountriesByCurrency(monnaie);
  }

  @Get('langue/:langue')
  @ApiOperation({
    summary: 'Récupérer les pays par langue officielle',
    description: 'Récupère tous les pays ayant une langue officielle spécifique'
  })
  @ApiParam({ name: 'langue', description: 'Nom de la langue', example: 'Français' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays récupérés avec succès' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Pays' } }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getCountriesByLanguage(@Param('langue') langue: string): Promise<ApiResponse<Pays[]>> {
    return this.paysDuMondeService.getCountriesByLanguage(langue);
  }

  @Get('animal/:animal')
  @ApiOperation({
    summary: 'Récupérer les pays par animal national',
    description: 'Récupère tous les pays ayant un animal national spécifique'
  })
  @ApiParam({ name: 'animal', description: 'Nom de l\'animal national', example: 'Coq gaulois' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays récupérés avec succès' },
        data: { type: 'array', items: { $ref: '#/components/schemas/Pays' } }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getCountriesByAnimal(@Param('animal') animal: string): Promise<ApiResponse<Pays[]>> {
    return this.paysDuMondeService.getCountriesByAnimal(animal);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Récupérer les statistiques des pays',
    description: 'Récupère des statistiques globales sur tous les pays'
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
            total: { type: 'number', example: 195 },
            activeCount: { type: 'number', example: 190 },
            byContinent: { type: 'array', items: { type: 'object' } },
            byPopulation: { type: 'array', items: { type: 'object' } },
            byAnimal: { type: 'array', items: { type: 'object' } },
            averagePopulation: { type: 'number', example: 40000000 },
            averageArea: { type: 'number', example: 500000 }
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
    return this.paysDuMondeService.getStats();
  }

  @Get('nom/:nom')
  @ApiOperation({
    summary: 'Récupérer un pays par nom',
    description: 'Récupère un pays en recherchant par son nom'
  })
  @ApiParam({ name: 'nom', description: 'Nom du pays', example: 'France' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays récupéré avec succès' },
        data: { $ref: '#/components/schemas/Pays' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Pays non trouvé'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findByNom(@Param('nom') nom: string): Promise<ApiResponse<Pays>> {
    return this.paysDuMondeService.findByNom(nom);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer un pays par ID',
    description: 'Récupère un pays spécifique par son identifiant unique'
  })
  @ApiParam({ name: 'id', description: 'ID du pays' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays récupéré avec succès' },
        data: { $ref: '#/components/schemas/Pays' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Pays non trouvé'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async findOne(@Param('id') id: string): Promise<ApiResponse<Pays>> {
    return this.paysDuMondeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mettre à jour un pays',
    description: 'Met à jour les informations d\'un pays existant (nécessite une authentification)'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID du pays' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Pays mis à jour avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Pays mis à jour avec succès' },
        data: { $ref: '#/components/schemas/Pays' }
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
    description: 'Pays non trouvé'
  })
  async update(
    @Param('id') id: string,
    @Body() updatePaysDuMondeDto: UpdatePaysDuMondeDto
  ): Promise<ApiResponse<Pays>> {
    return this.paysDuMondeService.update(id, updatePaysDuMondeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un pays',
    description: 'Supprime un pays de la base de données (nécessite une authentification)'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID du pays' })
  @SwaggerApiResponse({
    status: 204,
    description: 'Pays supprimé avec succès'
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
    description: 'Pays non trouvé'
  })
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    return this.paysDuMondeService.remove(id);
  }
} 