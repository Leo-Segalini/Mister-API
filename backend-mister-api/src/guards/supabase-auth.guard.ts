import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse();
    const { accessToken, refreshToken } = this.extractTokensFromRequest(request);

    if (!accessToken) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    try {
      // Vérifier et rafraîchir automatiquement le token si nécessaire
      const { user, newTokens, needsReauth } = await this.supabaseService.verifyAndRefreshToken(accessToken, refreshToken);
      
      if (needsReauth) {
        throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
      }

      if (!user) {
        throw new UnauthorizedException('Token invalide ou expiré');
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

        response.cookie('access_token', newTokens.access_token, cookieOptions);
        response.cookie('sb-access-token', newTokens.access_token, cookieOptions);
        response.cookie('refresh_token', newTokens.refresh_token, cookieOptions);
        response.cookie('sb-refresh-token', newTokens.refresh_token, cookieOptions);
      }

      // Récupérer les informations complètes depuis public.users
      const userProfile = await this.supabaseService.getUserProfile(user.id);
      
      // Ajouter l'utilisateur à la requête avec toutes les informations
      request.user = {
        id: user.id,
        email: user.email || '',
        role: userProfile?.role || 'user',
        created_at: userProfile?.created_at ? new Date(userProfile.created_at) : undefined,
        updated_at: userProfile?.updated_at ? new Date(userProfile.updated_at) : undefined,
        is_premium: userProfile?.is_premium || false,
        premium_expires_at: userProfile?.premium_expires_at ? new Date(userProfile.premium_expires_at) : new Date(),
        // Ajouter d'autres champs du profil si nécessaire
        nom: userProfile?.nom,
        prenom: userProfile?.prenom,
        telephone: userProfile?.telephone,
        adresse_postale: userProfile?.adresse_postale,
        code_postal: userProfile?.code_postal,
        ville: userProfile?.ville,
        pays: userProfile?.pays,
        date_naissance: userProfile?.date_naissance,
        stripe_customer_id: userProfile?.stripe_customer_id,
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Erreur d\'authentification');
    }
  }

  private extractTokensFromRequest(request: AuthenticatedRequest): { accessToken?: string; refreshToken?: string } {
    // Essayer d'abord les cookies (utiliser any pour contourner le problème TypeScript avec cookie-parser)
    const cookies = (request as any).cookies;
    if (cookies && typeof cookies === 'object') {
      const accessToken = cookies.access_token || cookies['sb-access-token'];
      const refreshToken = cookies.refresh_token || cookies['sb-refresh-token'];
      
      if (accessToken && typeof accessToken === 'string') {
        return { accessToken, refreshToken };
      }
    }

    // Fallback sur les headers Authorization
    const authHeader = request.headers?.authorization;
    if (!authHeader) return {};
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? { accessToken: token } : {};
  }
} 