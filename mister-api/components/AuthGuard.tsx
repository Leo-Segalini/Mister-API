'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected) return;
    
    // Attendre que l'authentification soit initialisée
    if (isLoading) return;

    // Vérifier le chemin actuel pour éviter les boucles
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/register', '/register/success', '/', '/docs', '/pricing'];
    const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

    if (requireAuth && !isAuthenticated) {
      // console.log('🚫 Access denied, redirecting to login...');
      setHasRedirected(true);
      router.push(redirectTo);
    } else if (!requireAuth && isAuthenticated && !isPublicPath) {
      // Seulement rediriger si on n'est pas déjà sur une page publique
      // console.log('✅ User already authenticated, redirecting to dashboard...');
      setHasRedirected(true);
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, hasRedirected]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Si l'authentification n'est pas requise et que l'utilisateur est connecté
  // Mais seulement si on n'est pas sur une page publique
  if (!requireAuth && isAuthenticated) {
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/register', '/register/success', '/', '/docs', '/pricing'];
    const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));
    
    if (!isPublicPath) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }
  }

  // Afficher le contenu si tout est OK
  return <>{children}</>;
} 