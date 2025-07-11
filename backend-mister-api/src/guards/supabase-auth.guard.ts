import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../services/supabase.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & AuthenticatedRequest>();
    console.log('🔐 SupabaseAuthGuard.canActivate called');
    console.log('🔗 URL:', request.url);
    console.log('🌐 Method:', request.method);
    console.log('🍪 Cookies:', request.cookies);
    console.log('📋 Headers:', request.headers?.authorization ? 'Authorization header present' : 'No Authorization header');
    
    const token = this.extractTokenFromHeader(request);
    console.log('🎫 Token extracted:', token ? 'Token found' : 'No token found');

    if (!token) {
      console.log('❌ No token found, throwing UnauthorizedException');
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    try {
      console.log('🔍 Verifying token with Supabase...');
      const user = await this.supabaseService.verifyToken(token);
      
      if (!user) {
        console.log('❌ Token verification failed: no user returned');
        throw new UnauthorizedException('Token invalide ou expiré');
      }
      
      console.log('✅ Token verified for user:', user.email);

      // Ajouter l'utilisateur à la requête pour utilisation ultérieure
      request.user = {
        id: user.id,
        email: user.email || '',
        role: 'user', // Rôle par défaut, sera vérifié par le RolesGuard
        created_at: user.created_at ? new Date(user.created_at) : undefined,
        updated_at: user.updated_at ? new Date(user.updated_at) : undefined,
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Erreur d\'authentification');
    }
  }

  private extractTokenFromHeader(request: Request & AuthenticatedRequest): string | undefined {
    // Essayer d'abord l'en-tête Authorization (Bearer token)
    const authHeader = request.headers?.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }
    
    // Si pas d'en-tête Authorization, essayer les cookies
    const cookies = request.cookies;
    if (cookies) {
      // Essayer d'abord le cookie access_token
      if (cookies.access_token) {
        return cookies.access_token;
      }
      // Sinon essayer le cookie sb-access-token
      if (cookies['sb-access-token']) {
        return cookies['sb-access-token'];
      }
    }
    
    return undefined;
  }
} 