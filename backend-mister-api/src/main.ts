import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuration globale
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'));

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
      if (!origin) return callback(null, true);
      
      // Vérifier si l'origine est dans la liste autorisée
      const isAllowed = corsOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          // Gestion des wildcards
          const pattern = allowedOrigin.replace('*', '.*');
          return new RegExp(pattern).test(origin);
        }
        return allowedOrigin === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log(`🚫 CORS bloqué pour l'origine: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Helmet pour la sécurité
  if (configService.get('HELMET_ENABLED', 'true') === 'true') {
    app.use(helmet());
  }

  // Swagger uniquement en développement
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Punchiline API')
      .setDescription('Documentation de l’API Punchiline')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1', app, document);
  }

  // Port d'écoute
  const port = configService.get('API_PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application démarrée sur http://localhost:${port}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api/v1`);
  }
  console.log(`🌍 Mode: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();
