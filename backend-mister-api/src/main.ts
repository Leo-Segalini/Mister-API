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

  // CORS - Configuration plus permissive pour résoudre les problèmes
  console.log('🔧 Configuration CORS...');
  
  app.enableCors({
    origin: true, // Autorise toutes les origines temporairement
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'x-api-key', 
      'Cookie', 
      'Origin', 
      'Accept',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods'
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Middleware CORS supplémentaire pour les requêtes OPTIONS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, Cookie');
    
    if (req.method === 'OPTIONS') {
      console.log('🔧 OPTIONS request handled');
      res.sendStatus(204);
      return;
    }
    
    next();
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
