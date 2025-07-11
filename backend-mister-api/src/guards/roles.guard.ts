import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SupabaseService } from '../services/supabase.service';
import { AuthenticatedRequest } from '../interfaces/request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupérer les rôles requis depuis les métadonnées
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle requis, autoriser l'accès
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    try {
      // Récupérer le rôle de l'utilisateur depuis Supabase
      const userRole = await this.getUserRole(user.id);
      
      // Vérifier si l'utilisateur a un des rôles requis
      const hasRequiredRole = requiredRoles.includes(userRole);
      
      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `Accès refusé. Rôles requis: ${requiredRoles.join(', ')}. Votre rôle: ${userRole}`
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new ForbiddenException('Erreur lors de la vérification des rôles');
    }
  }

  /**
   * Récupère le rôle de l'utilisateur depuis Supabase
   */
  private async getUserRole(userId: string): Promise<string> {
    return await this.supabaseService.getUserRole(userId);
  }
} 