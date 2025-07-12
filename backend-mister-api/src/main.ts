import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuration globale
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'));

  // Middleware pour capturer le body brut des webhooks Stripe
  app.use('/api/v1/payments/webhook', (req: Request, res: Response, next: NextFunction) => {
    // console.log('🔧 Webhook middleware triggered for:', req.url);
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      (req as any).rawBody = data;
      next();
    });
  });

  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Cookies
  app.use(cookieParser(configService.get('COOKIE_SECRET')));

  // CORS
  const corsOrigins = [
    'http://localhost:3000',
    'https://mister-api.vercel.app',
    'https://mister-fxsm9xtz9-leo-segalini-web-developper.vercel.app',
    'https://*.vercel.app', // Autorise tous les sous-domaines Vercel
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (comme les appels API directs)
      if (!origin) {
        console.log('🌐 CORS: Requête sans origin autorisée');
        return callback(null, true);
      }
      
      console.log(`🌐 CORS: Vérification de l'origine: ${origin}`);
      
      // Vérifier si l'origine est dans la liste autorisée
      const isAllowed = corsOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          // Gestion des wildcards
          const pattern = allowedOrigin.replace('*', '.*');
          const regex = new RegExp(pattern);
          const matches = regex.test(origin);
          console.log(`🌐 CORS: Pattern ${pattern} pour ${origin}: ${matches}`);
          return matches;
        }
        const matches = allowedOrigin === origin;
        console.log(`🌐 CORS: Exact match ${allowedOrigin} === ${origin}: ${matches}`);
        return matches;
      });
      
      if (isAllowed) {
        console.log(`✅ CORS: Origine ${origin} autorisée`);
        callback(null, true);
      } else {
        console.log(`🚫 CORS: Origine ${origin} bloquée`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cookie', 'Origin', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Helmet pour la sécurité
  if (configService.get('HELMET_ENABLED', 'true') === 'true') {
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
    }));
  }

  // Swagger uniquement en développement
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Punchiline API')
      .setDescription('Documentation de l\'API Punchiline')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1', app, document);
  }

  // Port d'écoute
  const port = configService.get('API_PORT', 3000);
  await app.listen(port);

  // console.log(`🚀 Application démarrée sur http://localhost:${port}`);
  if (process.env.NODE_ENV === 'development') {
    // console.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api/v1`);
  }
  // console.log(`🌍 Mode: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();
