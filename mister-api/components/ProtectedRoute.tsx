'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Composant de protection des routes unifié
 * Remplace AuthGuard pour une logique centralisée
 */
export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Attendre que l'authentification soit initialisée
    if (isLoading) {
      return;
    }

    // Marquer la vérification comme terminée
    setHasCheckedAuth(true);

    // Vérifier le chemin actuel pour éviter les boucles
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/register', '/register/success', '/', '/docs', '/pricing', '/apis', '/contact'];
    const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

    // Gestion des redirections
    if (requireAuth && !isAuthenticated) {
      console.log(`🚫 ProtectedRoute: Accès refusé à ${currentPath} - Redirection vers ${redirectTo}`);
      router.push(redirectTo);
      return;
    }

    if (requireAdmin && !isAdmin) {
      console.log(`🚫 ProtectedRoute: Accès admin refusé à ${currentPath} - Redirection vers dashboard`);
      router.push('/dashboard');
      return;
    }

    if (!requireAuth && isAuthenticated && !isPublicPath) {
      console.log(`✅ ProtectedRoute: Utilisateur connecté sur ${currentPath} - Redirection vers dashboard`);
      router.push('/dashboard');
      return;
    }

    console.log(`✅ ProtectedRoute: Accès autorisé à ${currentPath}`);
  }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, redirectTo, router]);

  // Afficher un loader pendant la vérification
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Vérifications finales avant d'afficher le contenu
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Accès refusé</h2>
          <p className="text-gray-400 mb-4">Vous devez être connecté pour accéder à cette page</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Accès refusé</h2>
          <p className="text-gray-400 mb-4">Vous devez être administrateur pour accéder à cette page</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  // Afficher le contenu si tout est OK
  return <>{children}</>;
} 