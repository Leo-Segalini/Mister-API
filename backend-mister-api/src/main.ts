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

  // CORS - Configuration optimisée pour les cookies cross-origin
  console.log('🔧 Configuration CORS...');
  
  const allowedOrigins = [
    'https://mister-api.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3000',
    'https://localhost:3001',
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origine (par exemple, les apps mobiles)
      if (!origin) return callback(null, true);
      
      // Autoriser les origines spécifiques
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS: Origine autorisée: ${origin}`);
        return callback(null, true);
      }
      
      // Pour le développement, autoriser toutes les origines localhost
      if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        console.log(`✅ CORS: Origine localhost autorisée: ${origin}`);
        return callback(null, true);
      }
      
      console.log(`❌ CORS: Origine refusée: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Essentiel pour les cookies
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
      'Access-Control-Allow-Methods',
      'X-Refresh-Token'
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization', 'X-Refresh-Token'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Middleware CORS supplémentaire pour gérer les requêtes OPTIONS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Vérifier si l'origine est autorisée
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, Cookie, X-Refresh-Token');
    
    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      console.log('🔧 OPTIONS preflight request handled for:', req.url);
      res.status(204).end();
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
