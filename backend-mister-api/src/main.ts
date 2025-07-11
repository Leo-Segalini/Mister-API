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
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
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
