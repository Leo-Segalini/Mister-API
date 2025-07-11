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
      const user = await this.supabaseService.verifyToken(token);
      
      if (!user) {
        throw new UnauthorizedException('Token invalide ou expiré');
      }

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

  private extractTokenFromHeader(request: AuthenticatedRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 