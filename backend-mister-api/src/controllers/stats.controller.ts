import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PunchlineService } from '../services/punchline.service';
import { AnimalService } from '../services/animal.service';
import { ApiKeyService } from '../services/api-key.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiResponse } from '../interfaces/api-response.interface';

@ApiTags('Statistiques Globales')
@Controller('stats')
@UseGuards(ApiKeyGuard)
export class StatsController {
  constructor(
    private readonly punchlineService: PunchlineService,
    private readonly animalService: AnimalService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  @Get('global')
  @ApiOperation({
    summary: 'Statistiques globales de l\'API',
    description: 'Récupère les statistiques globales de toutes les tables et de l\'utilisation de l\'API'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Statistiques globales récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statistiques globales récupérées avec succès' },
        data: {
          type: 'object',
          properties: {
            totalRecords: { type: 'number', example: 5000 },
            totalUsers: { type: 'number', example: 150 },
            totalApiKeys: { type: 'number', example: 300 },
            totalRequests: { type: 'number', example: 25000 },
            tables: {
              type: 'object',
              properties: {
                punchlines: { type: 'object' },
                animaux: { type: 'object' },
                pays: { type: 'object' }
              }
            },
            usage: {
              type: 'object',
              properties: {
                today: { type: 'number', example: 1250 },
                thisWeek: { type: 'number', example: 8500 },
                thisMonth: { type: 'number', example: 25000 }
              }
            }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getGlobalStats(): Promise<ApiResponse<any>> {
    try {
      // Récupérer les statistiques de chaque table
      const [punchlineStats, animalStats] = await Promise.all([
        this.punchlineService.getStats(),
        this.animalService.getStats(),
      ]);

      // Récupérer les statistiques globales de l'API
      const apiStats = await this.apiKeyService.getGlobalStats();

      // Calculer les totaux
      const totalRecords = 
        punchlineStats.data.total + 
        animalStats.data.total + 
        (apiStats.data?.totalCountries || 0);

      const totalUsers = apiStats.data?.totalUsers || 0;
      const totalApiKeys = apiStats.data?.totalApiKeys || 0;
      const totalRequests = apiStats.data?.totalRequests || 0;

      return {
        success: true,
        message: 'Statistiques globales récupérées avec succès',
        data: {
          totalRecords,
          totalUsers,
          totalApiKeys,
          totalRequests,
          tables: {
            punchlines: {
              total: punchlineStats.data.total,
              byCategory: punchlineStats.data.byCategory,
              byOrigin: punchlineStats.data.byOrigin,
              averageNote: punchlineStats.data.averageNote
            },
            animaux: {
              total: animalStats.data.total,
              byType: animalStats.data.byType,
              byConservation: animalStats.data.byConservation,
              domesticCount: animalStats.data.domesticCount,
              averageSize: animalStats.data.averageSize,
              averageWeight: animalStats.data.averageWeight
            }
          },
          usage: {
            today: apiStats.data?.todayRequests || 0,
            thisWeek: apiStats.data?.weekRequests || 0,
            thisMonth: apiStats.data?.monthRequests || 0
          },
          apiKeys: {
            total: totalApiKeys,
            byQuotaType: apiStats.data?.byQuotaType || [],
            activeKeys: apiStats.data?.activeKeys || 0
          }
        }
      };
    } catch (error) {
      throw new Error('Erreur lors de la récupération des statistiques globales');
    }
  }

  @Get('usage')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Statistiques d\'utilisation détaillées',
    description: 'Récupère les statistiques d\'utilisation détaillées (nécessite une authentification)'
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'], description: 'Période d\'analyse' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'Date de fin (YYYY-MM-DD)' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Statistiques d\'utilisation récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statistiques d\'utilisation récupérées avec succès' },
        data: {
          type: 'object',
          properties: {
            period: { type: 'string', example: 'month' },
            totalRequests: { type: 'number', example: 25000 },
            uniqueUsers: { type: 'number', example: 150 },
            averageRequestsPerDay: { type: 'number', example: 833 },
            peakUsage: { type: 'object' },
            byEndpoint: { type: 'array', items: { type: 'object' } },
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
  async getUsageStats(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<ApiResponse<any>> {
    try {
      const usageStats = await this.apiKeyService.getDetailedUsageStats({
        period,
        startDate,
        endDate
      });

      return {
        success: true,
        message: 'Statistiques d\'utilisation récupérées avec succès',
        data: usageStats
      };
    } catch (error) {
      throw new Error('Erreur lors de la récupération des statistiques d\'utilisation');
    }
  }

  @Get('performance')
  @ApiOperation({
    summary: 'Statistiques de performance',
    description: 'Récupère les statistiques de performance de l\'API'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Statistiques de performance récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Statistiques de performance récupérées avec succès' },
        data: {
          type: 'object',
          properties: {
            averageResponseTime: { type: 'number', example: 150 },
            uptime: { type: 'number', example: 99.9 },
            errorRate: { type: 'number', example: 0.1 },
            requestsPerSecond: { type: 'number', example: 25 },
            cacheHitRate: { type: 'number', example: 85.5 },
            slowestEndpoints: { type: 'array', items: { type: 'object' } },
            mostUsedEndpoints: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getPerformanceStats(): Promise<ApiResponse<any>> {
    try {
      const performanceStats = await this.apiKeyService.getPerformanceStats();

      return {
        success: true,
        message: 'Statistiques de performance récupérées avec succès',
        data: performanceStats
      };
    } catch (error) {
      throw new Error('Erreur lors de la récupération des statistiques de performance');
    }
  }

  @Get('trends')
  @ApiOperation({
    summary: 'Tendances d\'utilisation',
    description: 'Récupère les tendances d\'utilisation de l\'API sur différentes périodes'
  })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Nombre de jours à analyser', example: 30 })
  @SwaggerApiResponse({
    status: 200,
    description: 'Tendances récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tendances récupérées avec succès' },
        data: {
          type: 'object',
          properties: {
            period: { type: 'string', example: '30 days' },
            growth: { type: 'number', example: 15.5 },
            dailyRequests: { type: 'array', items: { type: 'object' } },
            newUsers: { type: 'array', items: { type: 'object' } },
            popularTables: { type: 'array', items: { type: 'object' } },
            topQueries: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: 403,
    description: 'Clé API invalide ou quota dépassé'
  })
  async getTrends(
    @Query('days') days: number = 30
  ): Promise<ApiResponse<any>> {
    try {
      const trends = await this.apiKeyService.getUsageTrends(days);

      return {
        success: true,
        message: 'Tendances récupérées avec succès',
        data: trends
      };
    } catch (error) {
      throw new Error('Erreur lors de la récupération des tendances');
    }
  }

  @Get('health')
  @ApiOperation({
    summary: 'État de santé de l\'API',
    description: 'Récupère l\'état de santé général de l\'API et de ses services'
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'État de santé récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'État de santé récupéré avec succès' },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            timestamp: { type: 'string', example: '2025-07-05T12:00:00Z' },
            uptime: { type: 'number', example: 86400 },
            services: {
              type: 'object',
              properties: {
                database: { type: 'string', example: 'connected' },
                redis: { type: 'string', example: 'connected' },
                supabase: { type: 'string', example: 'connected' }
              }
            },
            version: { type: 'string', example: '1.0.0' },
            environment: { type: 'string', example: 'production' }
          }
        }
      }
    }
  })
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      const startTime = process.uptime();
      
      // Vérifier la connectivité des services
      const healthChecks = await Promise.allSettled([
        this.apiKeyService.healthCheck(),
        // Ajouter d'autres vérifications de santé si nécessaire
      ]);

      const isHealthy = healthChecks.every(result => result.status === 'fulfilled');

      return {
        success: true,
        message: 'État de santé récupéré avec succès',
        data: {
          status: isHealthy ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          uptime: Math.floor(startTime),
          services: {
            database: 'connected', // À implémenter avec une vraie vérification
            redis: 'connected', // À implémenter avec une vraie vérification
            supabase: 'connected' // À implémenter avec une vraie vérification
          },
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la vérification de l\'état de santé',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }
} 