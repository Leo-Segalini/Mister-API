'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook pour gérer les droits d'administration
 * Vérifie si l'utilisateur a le rôle admin et redirige si nécessaire
 */
export function useAdmin(redirectTo = '/dashboard') {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Attendre que l'authentification soit chargée
    if (isLoading) return;

    // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si l'utilisateur n'est pas admin, rediriger
    if (!isAdmin) {
      // console.log('🚫 Access denied: User is not admin');
      router.push(redirectTo);
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, router, redirectTo]);

  return {
    isAdmin,
    isLoading,
    user,
    isAuthenticated
  };
}

/**
 * Hook pour vérifier les droits admin sans redirection automatique
 * Utile pour afficher/masquer des éléments conditionnellement
 */
export function useAdminCheck() {
  const { user, isAuthenticated } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isAuthenticated,
    user
  };
} 