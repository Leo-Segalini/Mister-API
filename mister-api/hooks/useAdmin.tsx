'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Hook pour gérer les droits d'administration
 * Utilise les données du contexte d'authentification pour vérifier le rôle admin
 */
export function useAdmin(redirectTo = '/dashboard') {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Vérifier le rôle admin à partir des données utilisateur
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const adminStatus = user.role === 'admin';
      setIsAdmin(adminStatus);

      // Si l'utilisateur n'est pas admin, rediriger
      if (!adminStatus) {
        console.log('🚫 Access denied: User is not admin');
        router.push(redirectTo);
      }
    } else if (!isLoading && !isAuthenticated) {
      setIsAdmin(false);
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo]);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la connexion admin
    if (!isLoading && !isAuthenticated) {
      router.push('/admin-login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  return {
    isAdmin,
    isLoading: isLoading,
    user,
    isAuthenticated
  };
}

/**
 * Hook pour vérifier les droits admin sans redirection automatique
 * Utile pour afficher/masquer des éléments conditionnellement
 */
export function useAdminCheck() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Vérifier le rôle admin à partir des données utilisateur
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const adminStatus = user.role === 'admin';
      setIsAdmin(adminStatus);
    } else if (!isLoading && !isAuthenticated) {
      setIsAdmin(false);
    }
  }, [isAuthenticated, isLoading, user]);
  
  return {
    isAdmin,
    isAuthenticated,
    isLoading,
    user
  };
} 