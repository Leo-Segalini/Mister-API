'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';

/**
 * Hook pour gérer les droits d'administration
 * Vérifie si l'utilisateur a le rôle admin dans public.users et redirige si nécessaire
 */
export function useAdmin(redirectTo = '/dashboard') {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingRole, setIsCheckingRole] = useState<boolean>(false);

  // Vérifier le rôle admin dans public.users
  useEffect(() => {
    const checkAdminRole = async () => {
    // Attendre que l'authentification soit chargée
      if (isLoading || !isAuthenticated) {
        setIsAdmin(false);
      return;
    }

      setIsCheckingRole(true);
      
      try {
        // console.log('🔍 Checking admin role in public.users...');
        const { role } = await apiService.checkAdminRole();
        
        // console.log('🔍 Admin role check result:', { role });
        const adminStatus = role === 'admin';
        setIsAdmin(adminStatus);

    // Si l'utilisateur n'est pas admin, rediriger
        if (!adminStatus) {
          // console.log('🚫 Access denied: User is not admin in public.users');
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('❌ Error checking admin role:', error);
        setIsAdmin(false);
        // En cas d'erreur, rediriger par sécurité
      router.push(redirectTo);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [isAuthenticated, isLoading, router, redirectTo]);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la connexion admin
    if (!isLoading && !isAuthenticated) {
      router.push('/gestion-administrateur-login');
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  return {
    isAdmin,
    isLoading: isLoading || isCheckingRole,
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingRole, setIsCheckingRole] = useState<boolean>(false);

  // Vérifier le rôle admin dans public.users
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated) {
        setIsAdmin(false);
        return;
      }

      setIsCheckingRole(true);
      
      try {
        const { role } = await apiService.checkAdminRole();
        const adminStatus = role === 'admin';
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('❌ Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [isAuthenticated]);
  
  return {
    isAdmin,
    isAuthenticated,
    isLoading: isCheckingRole,
    user
  };
} 