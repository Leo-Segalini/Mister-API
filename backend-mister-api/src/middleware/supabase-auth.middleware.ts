import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../services/supabase.service';

@Injectable()
export class SupabaseAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SupabaseAuthMiddleware.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Ne traiter que les routes qui nécessitent une authentification
      // Exclure les routes d'authentification et les routes publiques
      if (this.shouldSkipAuthentication(req.path)) {
        this.logger.debug(`⏭️ Skipping authentication for: ${req.method} ${req.path}`);
        return next();
      }

      // Récupération du token depuis les cookies HTTPS
      const token = req.cookies['access_token'] || req.cookies['sb-access-token'];
      
      this.logger.debug(`🔍 Checking authentication for ${req.method} ${req.path}`);
      this.logger.debug(`🔗 Full URL: ${req.originalUrl}`);
      this.logger.debug(`🌐 Host: ${req.get('host')}`);
      this.logger.debug(`🍪 Available cookies: ${Object.keys(req.cookies).join(', ')}`);
      this.logger.debug(`🍪 All cookies:`, req.cookies);
      this.logger.debug(`🌐 Origin: ${req.headers.origin}`);
      this.logger.debug(`🔗 Referer: ${req.headers.referer}`);
      
      if (!token) {
        this.logger.debug('❌ No access token found in cookies');
        // Si pas de token, on continue mais on marque l'utilisateur comme non authentifié
        req['user'] = null;
        req['userProfile'] = null;
        req['isAuthenticated'] = false;
        req['userId'] = null;
        return next();
      }

      this.logger.debug('🔐 Token found, verifying with Supabase...');

      // Vérification du token avec Supabase
      const user = await this.supabaseService.verifyToken(token);
      
      if (!user) {
        this.logger.debug('❌ Token verification failed');
        // Token invalide, on continue mais sans authentification
        req['user'] = null;
        req['userProfile'] = null;
        req['isAuthenticated'] = false;
        req['userId'] = null;
        return next();
      }

      this.logger.debug(`✅ Token verified for user: ${user.email}`);

      // Récupération des informations utilisateur depuis public.users
      let userProfile;
      try {
        userProfile = await this.supabaseService.getUserProfile(user.id);
        this.logger.debug(`📋 User profile loaded: ${userProfile ? 'found' : 'not found'}`);
      } catch (error) {
        this.logger.warn(`⚠️ User profile not found for ${user.id}:`, error.message);
        // L'utilisateur existe dans auth.users mais pas dans public.users
        userProfile = null;
      }

      // Ajout des informations utilisateur à la requête
      req['user'] = user;
      req['userProfile'] = userProfile;
      req['isAuthenticated'] = true;
      req['userId'] = user.id;

      this.logger.debug(`✅ User authenticated: ${user.email} (${user.id})`);
      
      next();
    } catch (error) {
      this.logger.error('💥 Error during authentication:', error);
      
      // En cas d'erreur, on continue sans authentification
      req['user'] = null;
      req['userProfile'] = null;
      req['isAuthenticated'] = false;
      req['userId'] = null;
      
      next();
    }
  }

  /**
   * Détermine si l'authentification doit être ignorée pour cette route
   */
  private shouldSkipAuthentication(path: string): boolean {
    const skipPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/logout',
      '/auth/reset-password',
      '/auth/resend-confirmation',
      '/auth/configure-brevo',
      '/auth/diagnose-brevo',
      '/auth/test-email',
      '/auth/generate-dns-records',
      '/auth/user-status',
      '/api/v1/punchlines',
      '/api/v1/pays',
      '/api/v1/animaux',
      '/api/v1/stats',
      '/webhook',
      '/newsletter/subscribe',
      '/newsletter/confirm',
      '/newsletter/unsubscribe',
      '/payments/prices',
      '/',
      '/docs',
      '/api/v1', // Documentation Swagger
    ];

    // Vérifier si le chemin commence par un des chemins à ignorer
    return skipPaths.some(skipPath => {
      if (skipPath.endsWith('/*')) {
        const basePath = skipPath.slice(0, -2);
        return path.startsWith(basePath);
      }
      return path.startsWith(skipPath);
    });
  }
} 