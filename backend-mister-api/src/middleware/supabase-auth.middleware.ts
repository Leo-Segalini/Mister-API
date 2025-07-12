import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../services/supabase.service';

@Injectable()
export class SupabaseAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SupabaseAuthMiddleware.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Récupération des tokens depuis les cookies HTTPS
      const accessToken = req.cookies['access_token'] || req.cookies['sb-access-token'];
      const refreshToken = req.cookies['refresh_token'] || req.cookies['sb-refresh-token'];
      
      this.logger.debug(`🔍 Checking authentication for ${req.method} ${req.path}`);
      this.logger.debug(`🔗 Full URL: ${req.originalUrl}`);
      this.logger.debug(`🌐 Host: ${req.get('host')}`);
      this.logger.debug(`🍪 Available cookies: ${Object.keys(req.cookies).join(', ')}`);
      this.logger.debug(`🍪 All cookies:`, req.cookies);
      this.logger.debug(`🌐 Origin: ${req.headers.origin}`);
      this.logger.debug(`🔗 Referer: ${req.headers.referer}`);
      
      if (!accessToken) {
        this.logger.debug('❌ No access token found in cookies');
        // Si pas de token, on continue mais on marque l'utilisateur comme non authentifié
        req['user'] = null;
        req['userProfile'] = null;
        req['isAuthenticated'] = false;
        req['userId'] = null;
        return next();
      }

      this.logger.debug('🔐 Token found, verifying with Supabase...');

      // Vérification et rafraîchissement automatique du token avec Supabase
      const { user, newTokens, needsReauth } = await this.supabaseService.verifyAndRefreshToken(accessToken, refreshToken);
      
      if (needsReauth) {
        this.logger.debug('❌ Session expired, reauthentication required');
        // Session expirée, on continue mais sans authentification
        req['user'] = null;
        req['userProfile'] = null;
        req['isAuthenticated'] = false;
        req['userId'] = null;
        return next();
      }
      
      if (!user) {
        this.logger.debug('❌ Token verification failed');
        // Token invalide, on continue mais sans authentification
        req['user'] = null;
        req['userProfile'] = null;
        req['isAuthenticated'] = false;
        req['userId'] = null;
        return next();
      }

      // Si de nouveaux tokens ont été générés, mettre à jour les cookies
      if (newTokens) {
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none' as const,
          maxAge: 4 * 60 * 60 * 1000, // 4 heures
          path: '/',
          domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
        };

        res.cookie('access_token', newTokens.access_token, cookieOptions);
        res.cookie('sb-access-token', newTokens.access_token, cookieOptions);
        res.cookie('refresh_token', newTokens.refresh_token, cookieOptions);
        res.cookie('sb-refresh-token', newTokens.refresh_token, cookieOptions);
        
        this.logger.debug('🔄 Tokens refreshed and cookies updated');
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
} 