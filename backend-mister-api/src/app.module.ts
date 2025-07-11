import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { ScheduleModule } from '@nestjs/schedule';
import * as winston from 'winston';
import * as redisStore from 'cache-manager-redis-store';

// Entités
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { ApiLog } from './entities/api-log.entity';
import { Punchline } from './entities/punchline.entity';
import { Pays } from './entities/pays.entity';
import { Animal } from './entities/animal.entity';
import { Payment } from './entities/payment.entity';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';

// Services
import { SupabaseService } from './services/supabase.service';
import { BrevoConfigService } from './services/brevo-config.service';
import { ApiKeyService } from './services/api-key.service';
import { PunchlineService } from './services/punchline.service';
import { AnimalService } from './services/animal.service';
import { PaysDuMondeService } from './services/pays-du-monde.service';
import { ScheduledTasksService } from './services/scheduled-tasks.service';
import { NotificationService } from './services/notification.service';
import { CacheService } from './services/cache.service';
import { StripeService } from './services/stripe.service';
import { WebhookService } from './services/webhook.service';
import { PaymentService } from './services/payment.service';
import { SubscriptionService } from './services/subscription.service';
import { NewsletterService } from './services/newsletter.service';

// Contrôleurs
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PunchlineController } from './controllers/punchline.controller';
import { AnimalController } from './controllers/animal.controller';
import { AuthController } from './controllers/auth.controller';
import { ApiKeyController } from './controllers/api-key.controller';
import { StatsController } from './controllers/stats.controller';
import { PaysDuMondeController } from './controllers/pays-du-monde.controller';
import { SecurityController } from './controllers/security.controller';
import { AdminController } from './controllers/admin.controller';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { NewsletterController } from './controllers/newsletter.controller';

// Middleware
import { SupabaseAuthMiddleware } from './middleware/supabase-auth.middleware';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuration TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User, ApiKey, ApiLog, Punchline, Pays, Animal, Payment, NewsletterSubscription],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        extra: {
          max: 20,
          connectionTimeoutMillis: 30000, // 30 secondes
          query_timeout: 30000,
          statement_timeout: 30000,
          idle_timeout: 30000,
        },
        retryAttempts: 10,
        retryDelay: 3000, // 3 secondes entre les tentatives
        keepConnectionAlive: true,
      }),
      inject: [ConfigService],
    }),

    // Configuration Redis Cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        url: configService.get('REDIS_URL'),
        ttl: 3600, // 1 heure
        max: 100, // Nombre maximum d'éléments en cache
      }),
      inject: [ConfigService],
    }),

    // Configuration Throttler (Rate Limiting)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: parseInt(configService.get('RATE_LIMIT_TTL', '60')),
            limit: parseInt(configService.get('RATE_LIMIT_LIMIT', '100')),
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Configuration Winston (Logs)
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        level: configService.get('LOG_LEVEL', 'info'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
          new winston.transports.File({
            filename: configService.get('LOG_FILE', 'logs/app.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ],
      }),
      inject: [ConfigService],
    }),

    // Module de planification pour les tâches automatiques
    ScheduleModule.forRoot(),

    // Modules TypeORM pour les entités
    TypeOrmModule.forFeature([User, ApiKey, ApiLog, Punchline, Pays, Animal, Payment, NewsletterSubscription]),
  ],
  controllers: [
    AppController, 
    PunchlineController, 
    AnimalController, 
    AuthController, 
    ApiKeyController, 
    StatsController, 
    PaysDuMondeController, 
    SecurityController, 
    AdminController, 
    PaymentController, 
    WebhookController,
    NewsletterController,
  ],
  providers: [
    AppService,
    SupabaseService,
    BrevoConfigService,
    ApiKeyService,
    PunchlineService,
    AnimalService,
    PaysDuMondeService,
    ScheduledTasksService,
    NotificationService,
    CacheService,
    StripeService,
    WebhookService,
    PaymentService,
    SubscriptionService,
    NewsletterService,
  ],
  exports: [SupabaseService, ApiKeyService, NewsletterService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Appliquer le middleware d'authentification à toutes les routes sauf auth et API
    consumer
      .apply(SupabaseAuthMiddleware)
      .exclude(
        'auth/*path', // Exclure toutes les routes d'authentification
        'api-keys/*path', // Exclure les routes des clés API (gérées par le guard)
        'api/v1/*path', // Exclure les routes API (gérées par ApiKeyGuard)
        'webhook/*path', // Exclure les webhooks
        'newsletter/subscribe', // Exclure l'abonnement newsletter
        'newsletter/confirm', // Exclure la confirmation newsletter
        'newsletter/unsubscribe', // Exclure le désabonnement newsletter
        'payments/prices', // Exclure l'endpoint des prix (accessible sans auth)
        '/', // Page d'accueil
        'docs/*path', // Documentation
        'stats/*path', // Statistiques publiques
      )
      .forRoutes('*');
  }
}
