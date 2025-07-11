import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Rôles prédéfinis
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

// Décorateurs prédéfinis pour les rôles courants
export const RequireAdmin = () => Roles(UserRole.ADMIN);
export const RequireModerator = () => Roles(UserRole.MODERATOR, UserRole.ADMIN);
export const RequireUser = () => Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN); 