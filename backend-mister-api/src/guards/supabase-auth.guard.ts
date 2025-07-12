import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    try {
      // Vérifier le token avec Supabase Auth
      const authUser = await this.supabaseService.verifyToken(token);
      
      if (!authUser) {
        throw new UnauthorizedException('Token invalide ou expiré');
      }

      console.log(`🔍 [GUARD] Auth user from token: ${authUser.email} (ID: ${authUser.id})`);

      // Récupérer les informations complètes depuis public.users
      const userProfile = await this.supabaseService.getUserProfile(authUser.id);
      
      console.log(`🔍 [GUARD] Profile from public.users: ${userProfile?.email} (ID: ${userProfile?.id})`);
      
      // Ajouter l'utilisateur à la requête avec toutes les informations
      request.user = {
        id: authUser.id,
        email: authUser.email || '',
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

  private extractTokenFromRequest(request: AuthenticatedRequest): string | undefined {
    // Essayer d'abord les cookies (utiliser any pour contourner le problème TypeScript avec cookie-parser)
    const cookies = (request as any).cookies;
    if (cookies && typeof cookies === 'object') {
      const tokenFromCookie = cookies.access_token || cookies['sb-access-token'];
      if (tokenFromCookie && typeof tokenFromCookie === 'string') {
        return tokenFromCookie;
      }
    }

    // Fallback sur les headers Authorization
    const authHeader = request.headers?.authorization;
    if (!authHeader) return undefined;
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
} 