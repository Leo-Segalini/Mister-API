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
  Headers,
  Patch,
  Delete,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthenticatedRequest, RawBodyRequest } from '../interfaces/request.interface';
import { StripeService, CreateCheckoutSessionDto, CreateSubscriptionDto } from '../services/stripe.service';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import { ApiResponse } from '../interfaces/api-response.interface';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto } from '../dto/payment.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { PaymentStatus } from '../entities/payment.entity';

@ApiTags('Paiements')
@Controller('payments')
@ApiBearerAuth()
@ApiHeader({ name: 'X-API-Key', description: 'Clé API requise pour certains endpoints' })
export class PaymentController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Crée une session de paiement pour l'upgrade premium
   */
  @Post('create-checkout-session')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Créer une session de paiement pour l\'upgrade premium' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        priceId: { type: 'string', description: 'ID du prix Stripe (optionnel, utilise le prix premium par défaut si non fourni)' },
        successUrl: { type: 'string', description: 'URL de succès' },
        cancelUrl: { type: 'string', description: 'URL d\'annulation' },
      },
      required: ['successUrl', 'cancelUrl'],
    },
  })
  @SwaggerApiResponse({ status: 201, description: 'Session de paiement créée' })
  async createCheckoutSession(
    @Body() data: { priceId?: string; successUrl: string; cancelUrl: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const session = await this.stripeService.createCheckoutSession({
      userId: req.user.id,
      priceId: data.priceId,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
    });

    return {
      success: true,
      message: 'Session de paiement créée avec succès',
      data: {
        sessionId: session.id,
        url: session.url,
      },
    };
  }

  /**
   * Crée un abonnement directement
   */
  @Post('create-subscription')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Créer un abonnement directement' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        priceId: { type: 'string', description: 'ID du prix Stripe' },
        paymentMethodId: { type: 'string', description: 'ID de la méthode de paiement' },
      },
      required: ['priceId', 'paymentMethodId'],
    },
  })
  @SwaggerApiResponse({ status: 201, description: 'Abonnement créé' })
  async createSubscription(
    @Body() data: { priceId: string; paymentMethodId: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const subscription = await this.stripeService.createSubscription({
      userId: req.user.id,
      priceId: data.priceId,
      paymentMethodId: data.paymentMethodId,
    });

    return {
      success: true,
      message: 'Abonnement créé avec succès',
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      },
    };
  }

  /**
   * Annule un abonnement
   */
  @Post('cancel-subscription/:subscriptionId')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Annuler un abonnement' })
  @ApiBearerAuth()
  @ApiParam({ name: 'subscriptionId', description: 'ID de l\'abonnement' })
  @SwaggerApiResponse({ status: 200, description: 'Abonnement annulé' })
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const subscription = await this.stripeService.cancelSubscription(subscriptionId);

    return {
      success: true,
      message: 'Abonnement annulé avec succès',
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    };
  }

  /**
   * Récupère les abonnements de l'utilisateur
   */
  @Get('subscriptions')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Récupérer les abonnements de l\'utilisateur' })
  @ApiBearerAuth()
  @SwaggerApiResponse({ status: 200, description: 'Abonnements récupérés' })
  async getUserSubscriptions(@Req() req: AuthenticatedRequest): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const subscriptions = await this.stripeService.getUserSubscriptions(req.user.id);

    return {
      success: true,
      message: 'Abonnements récupérés avec succès',
      data: subscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        currentPeriodStart: (sub as any).current_period_start || 0,
        currentPeriodEnd: (sub as any).current_period_end || 0,
        cancelAtPeriodEnd: (sub as any).cancel_at_period_end || false,
        items: sub.items.data.map(item => ({
          priceId: item.price.id,
          quantity: item.quantity,
        })),
      })),
    };
  }

  /**
   * Met à jour un abonnement
   */
  @Post('update-subscription/:subscriptionId')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un abonnement' })
  @ApiBearerAuth()
  @ApiParam({ name: 'subscriptionId', description: 'ID de l\'abonnement' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        priceId: { type: 'string', description: 'Nouvel ID de prix' },
      },
      required: ['priceId'],
    },
  })
  @SwaggerApiResponse({ status: 200, description: 'Abonnement mis à jour' })
  async updateSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() data: { priceId: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const subscription = await this.stripeService.updateSubscription(subscriptionId, data.priceId);

    return {
      success: true,
      message: 'Abonnement mis à jour avec succès',
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        items: subscription.items.data.map(item => ({
          priceId: item.price.id,
          quantity: item.quantity,
        })),
      },
    };
  }

  /**
   * Crée une session pour le portail client Stripe
   */
  @Post('create-portal-session')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Créer une session pour le portail client Stripe' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        returnUrl: { type: 'string', description: 'URL de retour' },
      },
      required: ['returnUrl'],
    },
  })
  @SwaggerApiResponse({ status: 201, description: 'Session du portail créée' })
  async createPortalSession(
    @Body() data: { returnUrl: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const session = await this.stripeService.createCustomerPortalSession(req.user.id, data.returnUrl);

    return {
      success: true,
      message: 'Session du portail créée avec succès',
      data: {
        url: session.url,
      },
    };
  }

  /**
   * Récupère les prix disponibles (accessible sans authentification)
   */
  @Get('prices')
  @ApiOperation({ summary: 'Récupérer les prix disponibles' })
  @SwaggerApiResponse({ status: 200, description: 'Prix récupérés' })
  async getPrices(): Promise<ApiResponse<any>> {
    const prices = await this.stripeService.getPrices();

    return {
      success: true,
      message: 'Prix récupérés avec succès',
      data: prices.map(price => ({
        id: price.id,
        nickname: price.nickname,
        currency: price.currency,
        unit_amount: price.unit_amount,
        recurring: price.recurring,
        metadata: price.metadata,
        product: {
          id: (price.product as any).id,
          name: (price.product as any).name,
          description: (price.product as any).description,
        },
      })),
    };
  }

  /**
   * Webhook Stripe pour les événements
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Stripe' })
  @SwaggerApiResponse({ status: 200, description: 'Webhook traité' })
  async handleWebhook(
    @Req() req: RawBodyRequest<any>,
    @Headers('stripe-signature') signature: string,
  ): Promise<ApiResponse<any>> {
    try {
      const event = this.stripeService.verifyWebhookSignature(req.rawBody, signature);
      await this.stripeService.handleWebhook(event);

      return {
        success: true,
        message: 'Webhook traité avec succès',
        data: { received: true },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du traitement du webhook',
        data: { error: error.message },
      };
    }
  }

  /**
   * Crée un remboursement
   */
  @Post('refund')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Créer un remboursement' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentIntentId: { type: 'string', description: 'ID du Payment Intent' },
        amount: { type: 'number', description: 'Montant du remboursement (optionnel)' },
      },
      required: ['paymentIntentId'],
    },
  })
  @SwaggerApiResponse({ status: 201, description: 'Remboursement créé' })
  async createRefund(
    @Body() data: { paymentIntentId: string; amount?: number },
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<any>> {
    if (!req.user?.id) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const refund = await this.stripeService.createRefund(data.paymentIntentId, data.amount);

    return {
      success: true,
      message: 'Remboursement créé avec succès',
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
    };
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Créer un nouveau paiement (Admin seulement)' })
  @SwaggerApiResponse({ status: 201, description: 'Paiement créé avec succès', type: PaymentResponseDto })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Récupérer tous les paiements (Admin seulement)' })
  @SwaggerApiResponse({ status: 200, description: 'Liste des paiements', type: [PaymentResponseDto] })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  findAll(): Promise<PaymentResponseDto[]> {
    return this.paymentService.findAll();
  }

  @Get('my-payments')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Récupérer mes paiements' })
  @SwaggerApiResponse({ status: 200, description: 'Liste des paiements de l\'utilisateur', type: [PaymentResponseDto] })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé' })
  findMyPayments(@Request() req): Promise<PaymentResponseDto[]> {
    return this.paymentService.findByUserId(req.user.id, req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Récupérer les paiements d\'un utilisateur spécifique' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @SwaggerApiResponse({ status: 200, description: 'Liste des paiements de l\'utilisateur', type: [PaymentResponseDto] })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  findByUserId(@Param('userId') userId: string): Promise<PaymentResponseDto[]> {
    return this.paymentService.findByUserId(userId, userId);
  }

  @Get('search')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Rechercher des paiements par critères (Admin seulement)' })
  @ApiQuery({ name: 'status', required: false, description: 'Statut du paiement' })
  @ApiQuery({ name: 'user_id', required: false, description: 'ID de l\'utilisateur' })
  @ApiQuery({ name: 'date_from', required: false, description: 'Date de début' })
  @ApiQuery({ name: 'date_to', required: false, description: 'Date de fin' })
  @ApiQuery({ name: 'min_amount', required: false, description: 'Montant minimum' })
  @ApiQuery({ name: 'max_amount', required: false, description: 'Montant maximum' })
  @SwaggerApiResponse({ status: 200, description: 'Résultats de la recherche', type: [PaymentResponseDto] })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  search(
    @Query('status') status?: PaymentStatus,
    @Query('user_id') user_id?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('min_amount') min_amount?: number,
    @Query('max_amount') max_amount?: number,
  ): Promise<PaymentResponseDto[]> {
    const criteria: any = {};
    
    if (status) criteria.status = status;
    if (user_id) criteria.user_id = user_id;
    if (date_from) criteria.date_from = new Date(date_from);
    if (date_to) criteria.date_to = new Date(date_to);
    if (min_amount) criteria.min_amount = min_amount;
    if (max_amount) criteria.max_amount = max_amount;

    return this.paymentService.search(criteria);
  }

  @Get('stats')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Récupérer les statistiques des paiements (Admin seulement)' })
  @SwaggerApiResponse({ status: 200, description: 'Statistiques des paiements' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  getStats() {
    return this.paymentService.getStats();
  }

  @Get(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Récupérer un paiement par ID (Admin seulement)' })
  @ApiParam({ name: 'id', description: 'ID du paiement' })
  @SwaggerApiResponse({ status: 200, description: 'Détails du paiement', type: PaymentResponseDto })
  @SwaggerApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Mettre à jour un paiement (Admin seulement)' })
  @ApiParam({ name: 'id', description: 'ID du paiement' })
  @SwaggerApiResponse({ status: 200, description: 'Paiement mis à jour avec succès', type: PaymentResponseDto })
  @SwaggerApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Supprimer un paiement (Admin seulement)' })
  @ApiParam({ name: 'id', description: 'ID du paiement' })
  @SwaggerApiResponse({ status: 200, description: 'Paiement supprimé avec succès' })
  @SwaggerApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @SwaggerApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  remove(@Param('id') id: string): Promise<void> {
    return this.paymentService.remove(id);
  }
} 