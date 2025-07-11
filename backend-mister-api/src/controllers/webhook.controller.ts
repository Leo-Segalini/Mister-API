import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Param,
  Query,
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
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { WebhookService, WebhookEvent } from '../services/webhook.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiResponse } from '../interfaces/api-response.interface';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Endpoint pour recevoir les webhooks Stripe
   */
  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Stripe' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        object: { type: 'string' },
        api_version: { type: 'string' },
        created: { type: 'number' },
        data: { type: 'object' },
        livemode: { type: 'boolean' },
        pending_webhooks: { type: 'number' },
        request: { type: 'object' },
        type: { type: 'string' },
      },
    },
  })
  @SwaggerApiResponse({ status: 200, description: 'Webhook traité' })
  async handleStripeWebhook(
    @Body() event: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<ApiResponse<any>> {
    try {
      const webhookEvent: WebhookEvent = {
        id: event.id,
        type: event.type,
        data: event.data,
        timestamp: new Date(event.created * 1000),
        source: 'stripe',
      };

      await this.webhookService.handlePaymentEvent(webhookEvent);

      return {
        success: true,
        message: 'Webhook Stripe traité avec succès',
        data: { received: true },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du traitement du webhook Stripe',
        data: { error: error.message },
      };
    }
  }

  /**
   * Déclenche un événement de sécurité
   */
  @Post('security')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Déclencher un événement de sécurité' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['api_key.rotated', 'api_key.suspicious_activity', 'user.login_failed', 'user.account_locked'] },
        data: { type: 'object' },
      },
      required: ['type', 'data'],
    },
  })
  @SwaggerApiResponse({ status: 201, description: 'Événement de sécurité déclenché' })
  async triggerSecurityEvent(
    @Body() data: { type: string; data: any },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    const webhookEvent: WebhookEvent = {
      id: uuidv4(),
      type: data.type,
      data: data.data,
      timestamp: new Date(),
      source: 'api',
    };

    await this.webhookService.handleSecurityEvent(webhookEvent);

    return {
      success: true,
      message: 'Événement de sécurité déclenché avec succès',
      data: { eventId: webhookEvent.id },
    };
  }

  /**
   * Déclenche un événement d'administration
   */
  @Post('admin')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Déclencher un événement d\'administration' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['user.created', 'user.updated', 'user.deleted', 'quota.exceeded', 'system.alert'] },
        data: { type: 'object' },
      },
      required: ['type', 'data'],
    },
  })
  @SwaggerApiResponse({ status: 201, description: 'Événement d\'administration déclenché' })
  async triggerAdminEvent(
    @Body() data: { type: string; data: any },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    const webhookEvent: WebhookEvent = {
      id: uuidv4(),
      type: data.type,
      data: data.data,
      timestamp: new Date(),
      source: 'api',
    };

    await this.webhookService.handleAdminEvent(webhookEvent);

    return {
      success: true,
      message: 'Événement d\'administration déclenché avec succès',
      data: { eventId: webhookEvent.id },
    };
  }

  /**
   * Teste un webhook
   */
  @Post('test/:configKey')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Tester un webhook' })
  @ApiBearerAuth()
  @ApiParam({ name: 'configKey', description: 'Clé de configuration du webhook' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        data: { type: 'object' },
      },
      required: ['type', 'data'],
    },
  })
  @SwaggerApiResponse({ status: 200, description: 'Webhook testé' })
  async testWebhook(
    @Param('configKey') configKey: string,
    @Body() data: { type: string; data: any },
  ): Promise<ApiResponse<any>> {
    const webhookEvent: WebhookEvent = {
      id: uuidv4(),
      type: data.type,
      data: data.data,
      timestamp: new Date(),
      source: 'test',
    };

    const success = await this.webhookService.sendWebhook(configKey, webhookEvent);

    return {
      success,
      message: success ? 'Webhook testé avec succès' : 'Échec du test webhook',
      data: { eventId: webhookEvent.id, success },
    };
  }

  /**
   * Récupère les configurations de webhooks
   */
  @Get('configs')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Récupérer les configurations de webhooks' })
  @ApiBearerAuth()
  @SwaggerApiResponse({ status: 200, description: 'Configurations récupérées' })
  async getWebhookConfigs(): Promise<ApiResponse<any>> {
    const configs = this.webhookService.getWebhookConfigs();
    const configsArray = Array.from(configs.entries()).map(([key, config]) => ({
      key,
      url: config.url,
      events: config.events,
      hasSecret: !!config.secret,
    }));

    return {
      success: true,
      message: 'Configurations de webhooks récupérées avec succès',
      data: configsArray,
    };
  }

  /**
   * Ajoute une configuration de webhook
   */
  @Post('configs')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Ajouter une configuration de webhook' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        url: { type: 'string' },
        events: { type: 'array', items: { type: 'string' } },
        secret: { type: 'string' },
        headers: { type: 'object' },
      },
      required: ['key', 'url', 'events'],
    },
  })
  @SwaggerApiResponse({ status: 201, description: 'Configuration ajoutée' })
  async addWebhookConfig(
    @Body() config: { key: string; url: string; events: string[]; secret?: string; headers?: Record<string, string> },
  ): Promise<ApiResponse<any>> {
    this.webhookService.addWebhookConfig(config.key, {
      url: config.url,
      events: config.events,
      secret: config.secret,
      headers: config.headers,
    });

    return {
      success: true,
      message: 'Configuration de webhook ajoutée avec succès',
      data: { key: config.key },
    };
  }

  /**
   * Supprime une configuration de webhook
   */
  @Post('configs/:key/delete')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Supprimer une configuration de webhook' })
  @ApiBearerAuth()
  @ApiParam({ name: 'key', description: 'Clé de configuration' })
  @SwaggerApiResponse({ status: 200, description: 'Configuration supprimée' })
  async removeWebhookConfig(@Param('key') key: string): Promise<ApiResponse<any>> {
    const removed = this.webhookService.removeWebhookConfig(key);

    return {
      success: removed,
      message: removed ? 'Configuration supprimée avec succès' : 'Configuration non trouvée',
      data: { key, removed },
    };
  }

  /**
   * Endpoint de santé pour les webhooks
   */
  @Get('health')
  @ApiOperation({ summary: 'Santé des webhooks' })
  @SwaggerApiResponse({ status: 200, description: 'Statut de santé' })
  async getHealth(): Promise<ApiResponse<any>> {
    const configs = this.webhookService.getWebhookConfigs();
    const activeConfigs = Array.from(configs.values()).filter(config => !!config.url);

    return {
      success: true,
      message: 'Service webhook opérationnel',
      data: {
        status: 'healthy',
        activeConfigs: activeConfigs.length,
        totalConfigs: configs.size,
      },
    };
  }

  /**
   * Endpoint pour les tests de webhook externes
   */
  @Post('external-test')
  @ApiOperation({ summary: 'Test de webhook externe' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        event: { type: 'object' },
        secret: { type: 'string' },
      },
      required: ['url', 'event'],
    },
  })
  @SwaggerApiResponse({ status: 200, description: 'Test effectué' })
  async testExternalWebhook(
    @Body() data: { url: string; event: any; secret?: string },
  ): Promise<ApiResponse<any>> {
    try {
      const webhookEvent: WebhookEvent = {
        id: uuidv4(),
        type: data.event.type || 'test',
        data: data.event.data || data.event,
        timestamp: new Date(),
        source: 'external_test',
      };

      // Créer une configuration temporaire
      const tempConfig = {
        url: data.url,
        events: ['*'],
        secret: data.secret,
      };

      const success = await this.webhookService.sendWebhook('temp', webhookEvent);

      return {
        success,
        message: success ? 'Test externe réussi' : 'Test externe échoué',
        data: { eventId: webhookEvent.id, success },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test externe',
        data: { error: error.message },
      };
    }
  }
} 