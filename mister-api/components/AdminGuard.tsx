'use client';

import { useAdmin } from '@/hooks/useAdmin';
import LoadingSpinner from './LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Composant de protection pour les routes admin
 * Vérifie que l'utilisateur est connecté et a le rôle admin
 */
export function AdminGuard({ 
  children, 
  fallback,
  redirectTo = '/dashboard' 
}: AdminGuardProps) {
  const { isAdmin, isLoading, isAuthenticated } = useAdmin(redirectTo);

  // Affichage du loading pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Vérification des droits d'administration...</span>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher le fallback ou rien
  if (!isAuthenticated) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-4">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <a
            href="/gestion-administrateur-login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            Connexion Admin
          </a>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas admin, afficher le fallback ou un message d'erreur
  if (!isAdmin) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les droits d'administration nécessaires pour accéder à cette page.
          </p>
          <a
            href={redirectTo}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retour au dashboard
          </a>
        </div>
      </div>
    );
  }

  // Si tout est OK, afficher le contenu protégé
  return <>{children}</>;
}

/**
 * Composant pour afficher conditionnellement du contenu admin
 * N'affiche le contenu que si l'utilisateur est admin
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
} 