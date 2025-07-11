import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    try {
      // Vérifier le token avec Supabase Auth
      const authUser = await this.supabaseService.verifyToken(token);
      
      if (!authUser) {
        throw new UnauthorizedException('Token invalide ou expiré');
      }

      // Récupérer les données complètes de l'utilisateur depuis public.users
      const userProfile = await this.supabaseService.getUserProfile(authUser.id);
      
      if (!userProfile) {
        throw new UnauthorizedException('Profil utilisateur non trouvé');
      }

      // Ajouter l'utilisateur complet à la requête pour utilisation ultérieure
      request.user = {
        id: userProfile.id,
        email: userProfile.email || authUser.email || '',
        role: userProfile.role || 'user',
        created_at: userProfile.created_at ? new Date(userProfile.created_at) : undefined,
        updated_at: userProfile.updated_at ? new Date(userProfile.updated_at) : undefined,
        // Ajouter les champs premium
        is_premium: userProfile.is_premium || false,
        premium_expires_at: userProfile.premium_expires_at ? new Date(userProfile.premium_expires_at) : undefined,
        // Ajouter les autres champs du profil
        nom: userProfile.nom,
        prenom: userProfile.prenom,
        date_naissance: userProfile.date_naissance,
        adresse_postale: userProfile.adresse_postale,
        code_postal: userProfile.code_postal,
        ville: userProfile.ville,
        pays: userProfile.pays,
        telephone: userProfile.telephone,
        stripe_customer_id: userProfile.stripe_customer_id,
        conditions_generales_acceptees: userProfile.conditions_generales_acceptees,
        politique_confidentialite_acceptee: userProfile.politique_confidentialite_acceptee,
        date_acceptation_conditions: userProfile.date_acceptation_conditions,
        date_acceptation_politique: userProfile.date_acceptation_politique,
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Erreur d\'authentification');
    }
  }

  private extractTokenFromHeader(request: AuthenticatedRequest): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return undefined;
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
} 