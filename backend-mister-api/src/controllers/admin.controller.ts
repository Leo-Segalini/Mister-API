import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  Request,
  Req,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequireAdmin } from '../decorators/roles.decorator';
import { PunchlineService } from '../services/punchline.service';
import { AnimalService } from '../services/animal.service';
import { PaysDuMondeService } from '../services/pays-du-monde.service';
import { ApiKeyService } from '../services/api-key.service';
import { PaymentService } from '../services/payment.service';
import { CreatePunchlineDto, UpdatePunchlineDto } from '../dto/punchline.dto';
import { CreateAnimalDto, UpdateAnimalDto } from '../dto/animal.dto';
import { CreatePaysDuMondeDto, UpdatePaysDuMondeDto } from '../dto/pays-du-monde.dto';
import { CreateApiKeyDto, UpdateApiKeyDto } from '../dto/api-key.dto';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';
import { ApiResponse } from '../interfaces/api-response.interface';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { PaymentStatus } from '../entities/payment.entity';
import { SubscriptionService } from '../services/subscription.service';
import { SupabaseService } from '../services/supabase.service';
import { Roles } from '../decorators/roles.decorator';
import { NewsletterService } from '../services/newsletter.service';

@ApiTags('Admin - Gestion des Données')
@Controller('admin')
@UseGuards(SupabaseAuthGuard, ApiKeyGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly punchlineService: PunchlineService,
    private readonly animalService: AnimalService,
    private readonly paysDuMondeService: PaysDuMondeService,
    private readonly apiKeyService: ApiKeyService,
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
    private readonly supabaseService: SupabaseService,
    private readonly newsletterService: NewsletterService,
  ) {}

  // ===== PUNCHLINES =====

  @Post('punchlines')
  @RequireAdmin()
  @ApiOperation({ summary: 'Créer une nouvelle punchline (Admin uniquement)' })
  @SwaggerApiResponse({ status: 201, description: 'Punchline créée avec succès' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async createPunchline(@Body() createPunchlineDto: CreatePunchlineDto): Promise<ApiResponse> {
    try {
      const punchline = await this.punchlineService.create(createPunchlineDto);
      
      return {
        success: true,
        message: 'Punchline créée avec succès',
        data: punchline,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la création de la punchline',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('punchlines')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer toutes les punchlines (Admin uniquement)' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'search', required: false, description: 'Terme de recherche' })
  @SwaggerApiResponse({ status: 200, description: 'Liste des punchlines récupérée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getAllPunchlines(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponse> {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;
      
      const result = await this.punchlineService.findAll({ page: pageNum, limit: limitNum, search });
      
      return {
        success: true,
        message: 'Punchlines récupérées avec succès',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des punchlines',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('punchlines/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer une punchline par ID (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la punchline' })
  @SwaggerApiResponse({ status: 200, description: 'Punchline récupérée' })
  @SwaggerApiResponse({ status: 404, description: 'Punchline non trouvée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getPunchlineById(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    try {
      const punchline = await this.punchlineService.findOne(id.toString());
      
      if (!punchline) {
        throw new HttpException(
          {
            success: false,
            message: 'Punchline non trouvée',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Punchline récupérée avec succès',
        data: punchline,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération de la punchline',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('punchlines/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour une punchline (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la punchline' })
  @SwaggerApiResponse({ status: 200, description: 'Punchline mise à jour' })
  @SwaggerApiResponse({ status: 404, description: 'Punchline non trouvée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async updatePunchline(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePunchlineDto: UpdatePunchlineDto,
  ): Promise<ApiResponse> {
    try {
      const punchline = await this.punchlineService.update(id.toString(), updatePunchlineDto);
      
      if (!punchline) {
        throw new HttpException(
          {
            success: false,
            message: 'Punchline non trouvée',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Punchline mise à jour avec succès',
        data: punchline,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour de la punchline',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('punchlines/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour partiellement une punchline (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la punchline' })
  @SwaggerApiResponse({ status: 200, description: 'Punchline mise à jour partiellement' })
  @SwaggerApiResponse({ status: 404, description: 'Punchline non trouvée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async patchPunchline(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePunchlineDto: Partial<UpdatePunchlineDto>,
  ): Promise<ApiResponse> {
    try {
      const punchline = await this.punchlineService.update(id.toString(), updatePunchlineDto);
      
      if (!punchline) {
        throw new HttpException(
          {
            success: false,
            message: 'Punchline non trouvée',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Punchline mise à jour partiellement avec succès',
        data: punchline,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour partielle de la punchline',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('punchlines/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Supprimer une punchline (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la punchline' })
  @SwaggerApiResponse({ status: 200, description: 'Punchline supprimée' })
  @SwaggerApiResponse({ status: 404, description: 'Punchline non trouvée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async deletePunchline(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    try {
      const deleted = await this.punchlineService.remove(id.toString());
      
      if (!deleted) {
        throw new HttpException(
          {
            success: false,
            message: 'Punchline non trouvée',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Punchline supprimée avec succès',
        data: { id },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la suppression de la punchline',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== ANIMAUX =====

  @Post('animaux')
  @RequireAdmin()
  @ApiOperation({ summary: 'Créer un nouvel animal (Admin uniquement)' })
  @SwaggerApiResponse({ status: 201, description: 'Animal créé avec succès' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async createAnimal(@Body() createAnimalDto: CreateAnimalDto): Promise<ApiResponse> {
    try {
      const animal = await this.animalService.create(createAnimalDto);
      
      return {
        success: true,
        message: 'Animal créé avec succès',
        data: animal,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la création de l\'animal',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('animaux')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer tous les animaux (Admin uniquement)' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'search', required: false, description: 'Terme de recherche' })
  @SwaggerApiResponse({ status: 200, description: 'Liste des animaux récupérée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getAllAnimaux(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponse> {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;
      
      const result = await this.animalService.findAll({ page: pageNum, limit: limitNum, search });
      
      return {
        success: true,
        message: 'Animaux récupérés avec succès',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des animaux',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('animaux/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer un animal par ID (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de l\'animal' })
  @SwaggerApiResponse({ status: 200, description: 'Animal récupéré' })
  @SwaggerApiResponse({ status: 404, description: 'Animal non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getAnimalById(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    try {
      const animal = await this.animalService.findOne(id.toString());
      
      if (!animal) {
        throw new HttpException(
          {
            success: false,
            message: 'Animal non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Animal récupéré avec succès',
        data: animal,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération de l\'animal',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('animaux/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour un animal (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de l\'animal' })
  @SwaggerApiResponse({ status: 200, description: 'Animal mis à jour' })
  @SwaggerApiResponse({ status: 404, description: 'Animal non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async updateAnimal(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ): Promise<ApiResponse> {
    try {
      const animal = await this.animalService.update(id.toString(), updateAnimalDto);
      
      if (!animal) {
        throw new HttpException(
          {
            success: false,
            message: 'Animal non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Animal mis à jour avec succès',
        data: animal,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour de l\'animal',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('animaux/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour partiellement un animal (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de l\'animal' })
  @SwaggerApiResponse({ status: 200, description: 'Animal mis à jour partiellement' })
  @SwaggerApiResponse({ status: 404, description: 'Animal non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async patchAnimal(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnimalDto: Partial<UpdateAnimalDto>,
  ): Promise<ApiResponse> {
    try {
      const animal = await this.animalService.update(id.toString(), updateAnimalDto);
      
      if (!animal) {
        throw new HttpException(
          {
            success: false,
            message: 'Animal non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Animal mis à jour partiellement avec succès',
        data: animal,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour partielle de l\'animal',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('animaux/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Supprimer un animal (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de l\'animal' })
  @SwaggerApiResponse({ status: 200, description: 'Animal supprimé' })
  @SwaggerApiResponse({ status: 404, description: 'Animal non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async deleteAnimal(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    try {
      const deleted = await this.animalService.remove(id.toString());
      
      if (!deleted) {
        throw new HttpException(
          {
            success: false,
            message: 'Animal non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Animal supprimé avec succès',
        data: { id },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la suppression de l\'animal',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== PAYS =====

  @Post('pays')
  @RequireAdmin()
  @ApiOperation({ summary: 'Créer un nouveau pays (Admin uniquement)' })
  @SwaggerApiResponse({ status: 201, description: 'Pays créé avec succès' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async createPays(@Body() createPaysDto: CreatePaysDuMondeDto): Promise<ApiResponse> {
    try {
      const pays = await this.paysDuMondeService.create(createPaysDto);
      
      return {
        success: true,
        message: 'Pays créé avec succès',
        data: pays,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la création du pays',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pays')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer tous les pays (Admin uniquement)' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'search', required: false, description: 'Terme de recherche' })
  @SwaggerApiResponse({ status: 200, description: 'Liste des pays récupérée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getAllPays(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponse> {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;
      
      const result = await this.paysDuMondeService.findAll({ page: pageNum, limit: limitNum, search });
      
      return {
        success: true,
        message: 'Pays récupérés avec succès',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des pays',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pays/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer un pays par ID (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du pays' })
  @SwaggerApiResponse({ status: 200, description: 'Pays récupéré' })
  @SwaggerApiResponse({ status: 404, description: 'Pays non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getPaysById(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    try {
      const pays = await this.paysDuMondeService.findOne(id.toString());
      
      if (!pays) {
        throw new HttpException(
          {
            success: false,
            message: 'Pays non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Pays récupéré avec succès',
        data: pays,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération du pays',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('pays/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour un pays (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du pays' })
  @SwaggerApiResponse({ status: 200, description: 'Pays mis à jour' })
  @SwaggerApiResponse({ status: 404, description: 'Pays non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async updatePays(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaysDto: UpdatePaysDuMondeDto,
  ): Promise<ApiResponse> {
    try {
      const pays = await this.paysDuMondeService.update(id.toString(), updatePaysDto);
      
      if (!pays) {
        throw new HttpException(
          {
            success: false,
            message: 'Pays non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Pays mis à jour avec succès',
        data: pays,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour du pays',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('pays/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour partiellement un pays (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du pays' })
  @SwaggerApiResponse({ status: 200, description: 'Pays mis à jour partiellement' })
  @SwaggerApiResponse({ status: 404, description: 'Pays non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async patchPays(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaysDto: Partial<UpdatePaysDuMondeDto>,
  ): Promise<ApiResponse> {
    try {
      const pays = await this.paysDuMondeService.update(id.toString(), updatePaysDto);
      
      if (!pays) {
        throw new HttpException(
          {
            success: false,
            message: 'Pays non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Pays mis à jour partiellement avec succès',
        data: pays,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour partielle du pays',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('pays/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Supprimer un pays (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du pays' })
  @SwaggerApiResponse({ status: 200, description: 'Pays supprimé' })
  @SwaggerApiResponse({ status: 404, description: 'Pays non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async deletePays(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    try {
      const deleted = await this.paysDuMondeService.remove(id.toString());
      
      if (!deleted) {
        throw new HttpException(
          {
            success: false,
            message: 'Pays non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Pays supprimé avec succès',
        data: { id },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la suppression du pays',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== CLÉS API =====

  @Post('api-keys')
  @RequireAdmin()
  @ApiOperation({ summary: 'Créer une nouvelle clé API (Admin uniquement)' })
  @SwaggerApiResponse({ status: 201, description: 'Clé API créée avec succès' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async createApiKey(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    try {
      const apiKey = await this.apiKeyService.create(createApiKeyDto, req.user?.id || 'admin');
      
      return {
        success: true,
        message: 'Clé API créée avec succès',
        data: apiKey,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la création de la clé API',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('api-keys')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer toutes les clés API (Admin uniquement)' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'search', required: false, description: 'Terme de recherche' })
  @SwaggerApiResponse({ status: 200, description: 'Liste des clés API récupérée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getAllApiKeys(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponse> {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;
      
      const result = await this.apiKeyService.getUserApiKeys('admin');
      
      return {
        success: true,
        message: 'Clés API récupérées avec succès',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des clés API',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('api-keys/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer une clé API par ID (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({ status: 200, description: 'Clé API récupérée' })
  @SwaggerApiResponse({ status: 404, description: 'Clé API non trouvée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getApiKeyById(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse> {
    try {
      const apiKey = await this.apiKeyService.findOneByUser(id.toString(), 'admin');
      
      if (!apiKey) {
        throw new HttpException(
          {
            success: false,
            message: 'Clé API non trouvée',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Clé API récupérée avec succès',
        data: apiKey,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération de la clé API',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('api-keys/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour une clé API (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({ status: 200, description: 'Clé API mise à jour' })
  @SwaggerApiResponse({ status: 404, description: 'Clé API non trouvée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async updateApiKey(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    try {
      const apiKey = await this.apiKeyService.updateApiKey(id.toString(), req.user?.id || 'admin', updateApiKeyDto);
      
      if (!apiKey) {
        throw new HttpException(
          {
            success: false,
            message: 'Clé API non trouvée',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Clé API mise à jour avec succès',
        data: apiKey,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour de la clé API',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('api-keys/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour partiellement une clé API (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({ status: 200, description: 'Clé API mise à jour partiellement' })
  @SwaggerApiResponse({ status: 404, description: 'Clé API non trouvée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async patchApiKey(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApiKeyDto: Partial<UpdateApiKeyDto>,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    try {
      const apiKey = await this.apiKeyService.updateApiKey(id.toString(), req.user?.id || 'admin', updateApiKeyDto);
      
      if (!apiKey) {
        throw new HttpException(
          {
            success: false,
            message: 'Clé API non trouvée',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Clé API mise à jour partiellement avec succès',
        data: apiKey,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour partielle de la clé API',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('api-keys/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Supprimer une clé API (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la clé API' })
  @SwaggerApiResponse({ status: 200, description: 'Clé API supprimée' })
  @SwaggerApiResponse({ status: 404, description: 'Clé API non trouvée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async deleteApiKey(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    try {
      const deleted = await this.apiKeyService.deleteApiKey(id.toString(), req.user?.id || 'admin');
      
      if (!deleted) {
        throw new HttpException(
          {
            success: false,
            message: 'Clé API non trouvée',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Clé API supprimée avec succès',
        data: { id },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la suppression de la clé API',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== PAIEMENTS =====

  @Post('payments')
  @RequireAdmin()
  @ApiOperation({ summary: 'Créer un nouveau paiement (Admin uniquement)' })
  @SwaggerApiResponse({ status: 201, description: 'Paiement créé avec succès' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<ApiResponse> {
    try {
      const payment = await this.paymentService.create(createPaymentDto);
      
      return {
        success: true,
        message: 'Paiement créé avec succès',
        data: payment,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la création du paiement',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payments')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer tous les paiements (Admin uniquement)' })
  @SwaggerApiResponse({ status: 200, description: 'Liste des paiements récupérée' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getAllPayments(): Promise<ApiResponse> {
    try {
      const payments = await this.paymentService.findAll();
      
      return {
        success: true,
        message: 'Paiements récupérés avec succès',
        data: payments,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des paiements',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payments/search')
  @RequireAdmin()
  @ApiOperation({ summary: 'Rechercher des paiements par critères (Admin uniquement)' })
  @ApiQuery({ name: 'status', required: false, description: 'Statut du paiement' })
  @ApiQuery({ name: 'user_id', required: false, description: 'ID de l\'utilisateur' })
  @ApiQuery({ name: 'date_from', required: false, description: 'Date de début' })
  @ApiQuery({ name: 'date_to', required: false, description: 'Date de fin' })
  @ApiQuery({ name: 'min_amount', required: false, description: 'Montant minimum' })
  @ApiQuery({ name: 'max_amount', required: false, description: 'Montant maximum' })
  @SwaggerApiResponse({ status: 200, description: 'Résultats de la recherche' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async searchPayments(
    @Query('status') status?: PaymentStatus,
    @Query('user_id') user_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('min_amount') min_amount?: number,
    @Query('max_amount') max_amount?: number,
  ): Promise<ApiResponse> {
    try {
      const criteria: any = {};
      
      if (status) criteria.status = status;
      if (user_id) criteria.user_id = user_id;
      if (date_from) criteria.date_from = new Date(date_from);
      if (date_to) criteria.date_to = new Date(date_to);
      if (min_amount) criteria.min_amount = min_amount;
      if (max_amount) criteria.max_amount = max_amount;

      const payments = await this.paymentService.search(criteria);
      
      return {
        success: true,
        message: 'Recherche de paiements effectuée avec succès',
        data: payments,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la recherche des paiements',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payments/stats')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer les statistiques des paiements (Admin uniquement)' })
  @SwaggerApiResponse({ status: 200, description: 'Statistiques des paiements' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getPaymentStats(): Promise<ApiResponse> {
    try {
      const stats = await this.paymentService.getStats();
      
      return {
        success: true,
        message: 'Statistiques des paiements récupérées avec succès',
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des statistiques',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payments/user/:userId')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer les paiements d\'un utilisateur spécifique (Admin uniquement)' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @SwaggerApiResponse({ status: 200, description: 'Paiements de l\'utilisateur' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getPaymentsByUserId(@Param('userId') userId: string): Promise<ApiResponse> {
    try {
      const payments = await this.paymentService.findByUserId(userId, userId);
      
      return {
        success: true,
        message: 'Paiements de l\'utilisateur récupérés avec succès',
        data: payments,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des paiements de l\'utilisateur',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payments/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer un paiement par ID (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du paiement' })
  @SwaggerApiResponse({ status: 200, description: 'Paiement récupéré' })
  @SwaggerApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getPaymentById(@Param('id') id: string): Promise<ApiResponse> {
    try {
      const payment = await this.paymentService.findOne(id);
      
      if (!payment) {
        throw new HttpException(
          {
            success: false,
            message: 'Paiement non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Paiement récupéré avec succès',
        data: payment,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération du paiement',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('payments/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Mettre à jour partiellement un paiement (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du paiement' })
  @SwaggerApiResponse({ status: 200, description: 'Paiement mis à jour' })
  @SwaggerApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<ApiResponse> {
    try {
      const payment = await this.paymentService.update(id, updatePaymentDto);
      
      if (!payment) {
        throw new HttpException(
          {
            success: false,
            message: 'Paiement non trouvé',
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Paiement mis à jour avec succès',
        data: payment,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la mise à jour du paiement',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('payments/:id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Supprimer un paiement (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du paiement' })
  @SwaggerApiResponse({ status: 200, description: 'Paiement supprimé' })
  @SwaggerApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async deletePayment(@Param('id') id: string): Promise<ApiResponse> {
    try {
      await this.paymentService.remove(id);
      
      return {
        success: true,
        message: 'Paiement supprimé avec succès',
        data: { id },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la suppression du paiement',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('subscriptions/check')
  @ApiOperation({
    summary: 'Vérifier manuellement les abonnements expirés',
    description: 'Force la vérification des abonnements expirés (admin seulement)'
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @SwaggerApiResponse({
    status: 200,
    description: 'Vérification terminée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Vérification des abonnements terminée' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Accès refusé'
  })
  async checkSubscriptions(@Req() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.subscriptionService.manualSubscriptionCheck();
  }

  @Get('subscriptions/stats')
  @ApiOperation({
    summary: 'Récupérer les statistiques des abonnements',
    description: 'Récupère les statistiques des abonnements premium (admin seulement)'
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @SwaggerApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            premium: { type: 'number', example: 25 },
            expired: { type: 'number', example: 10 },
            active: { type: 'number', example: 15 },
            expirationRate: { type: 'string', example: '10.00' }
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
    status: 403,
    description: 'Accès refusé'
  })
  async getSubscriptionStats(@Req() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.subscriptionService.getSubscriptionStats();
  }

  @Post('subscriptions/check-user/:userId')
  @ApiOperation({
    summary: 'Vérifier l\'abonnement d\'un utilisateur spécifique',
    description: 'Force la vérification de l\'abonnement d\'un utilisateur (admin seulement)'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @SwaggerApiResponse({
    status: 200,
    description: 'Vérification terminée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Abonnement vérifié' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Accès refusé'
  })
  async checkUserSubscription(
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.subscriptionService.checkUserSubscription(userId);
  }

  @Post('subscriptions/reactivate-keys/:userId')
  @ApiOperation({
    summary: 'Réactiver les clés premium d\'un utilisateur',
    description: 'Réactive manuellement toutes les clés API premium d\'un utilisateur (admin seulement)'
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @SwaggerApiResponse({
    status: 200,
    description: 'Clés premium réactivées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Clés premium réactivées avec succès' },
        data: { type: 'object' }
      }
    }
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Non authentifié'
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Accès refusé'
  })
  async reactivateUserPremiumKeys(
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest
  ) {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('reactivate_user_premium_keys', { user_id_param: userId });

      if (error) {
        throw error;
      }

      return {
        success: data.success,
        message: data.message,
        data: data
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la réactivation des clés premium pour ${userId}:`, error);
      throw error;
    }
  }

  // ===== NEWSLETTER =====

  @Post('newsletter/send')
  @RequireAdmin()
  @ApiOperation({ summary: 'Envoyer une newsletter à tous les abonnés actifs (Admin uniquement)' })
  @SwaggerApiResponse({ status: 200, description: 'Newsletter envoyée avec succès' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async sendNewsletter(
    @Body() data: { subject: string; content: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    try {
      const result = await this.newsletterService.sendNewsletter(data.subject, data.content);
      
      return {
        success: true,
        message: 'Newsletter envoyée avec succès',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de l\'envoi de la newsletter',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('newsletter/stats')
  @RequireAdmin()
  @ApiOperation({ summary: 'Récupérer les statistiques de la newsletter (Admin uniquement)' })
  @SwaggerApiResponse({ status: 200, description: 'Statistiques récupérées' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async getNewsletterStats(@Req() req: AuthenticatedRequest): Promise<ApiResponse> {
    try {
      const stats = await this.newsletterService.getStats();
      
      return {
        success: true,
        message: 'Statistiques newsletter récupérées avec succès',
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des statistiques newsletter',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('newsletter/cleanup')
  @RequireAdmin()
  @ApiOperation({ summary: 'Nettoyer les tokens newsletter expirés (Admin uniquement)' })
  @SwaggerApiResponse({ status: 200, description: 'Nettoyage effectué' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Rôle admin requis' })
  async cleanupNewsletterTokens(@Req() req: AuthenticatedRequest): Promise<ApiResponse> {
    try {
      const result = await this.newsletterService.cleanupExpiredTokens();
      
      return {
        success: true,
        message: 'Nettoyage des tokens newsletter effectué',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors du nettoyage des tokens newsletter',
          error: error.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 