import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';

interface UserProfile {
  id: string;
  email?: string;
  role?: string;
  is_premium?: boolean;
  premium_expires_at?: string;
  created_at?: string;
  updated_at?: string;
  nom?: string;
  prenom?: string;
  date_naissance?: string;
  adresse_postale?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
  stripe_customer_id?: string;
  conditions_generales_acceptees?: boolean;
  politique_confidentialite_acceptee?: boolean;
  date_acceptation_conditions?: string;
  date_acceptation_politique?: string;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    this.logger.debug(`🔍 [GUARD] Checking authentication for ${request.method} ${request.url}`);

    if (!token) {
      this.logger.debug(`❌ [GUARD] No token found in headers`);
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    this.logger.debug(`🔑 [GUARD] Token found, length: ${token.length}`);

    try {
      // Vérifier le token avec Supabase Auth
      this.logger.debug(`🔐 [GUARD] Verifying token with Supabase...`);
      const authUser = await this.supabaseService.verifyToken(token);
      
      if (!authUser) {
        this.logger.debug(`❌ [GUARD] Token verification failed`);
        throw new UnauthorizedException('Token invalide ou expiré');
      }

      this.logger.debug(`✅ [GUARD] Token verified for user: ${authUser.email}`);

      // Récupérer les données complètes de l'utilisateur depuis public.users
      this.logger.debug(`📋 [GUARD] Fetching user profile for ID: ${authUser.id}`);
      let userProfile: UserProfile | null = null;
      
      try {
        userProfile = await this.supabaseService.getUserProfile(authUser.id);
        this.logger.debug(`✅ [GUARD] User profile loaded: found (is_premium: ${userProfile?.is_premium})`);
      } catch (profileError) {
        this.logger.warn(`⚠️ [GUARD] Could not fetch user profile for ${authUser.id}: ${profileError.message}`);
        this.logger.debug(`📋 [GUARD] Using basic auth user data as fallback`);
        // Utiliser les données de base de l'utilisateur si le profil n'est pas trouvé
        userProfile = {
          id: authUser.id,
          email: authUser.email,
          role: 'user',
          is_premium: false,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at
        };
      }

      // À ce point, userProfile ne peut plus être null
      if (!userProfile) {
        this.logger.error(`❌ [GUARD] User profile is null after all attempts`);
        throw new UnauthorizedException('Impossible de récupérer le profil utilisateur');
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
        date_acceptation_conditions: userProfile.date_acceptation_conditions ? new Date(userProfile.date_acceptation_conditions) : undefined,
        date_acceptation_politique: userProfile.date_acceptation_politique ? new Date(userProfile.date_acceptation_politique) : undefined,
      };
      
      this.logger.debug(`✅ [GUARD] Authentication successful for: ${request.user?.email} (premium: ${request.user?.is_premium})`);
      return true;
    } catch (error) {
      this.logger.error(`❌ [GUARD] Authentication error: ${error.message}`, error.stack);
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