'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import type { User, AuthResponse, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (userData: RegisterData) => Promise<void>;
  signout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fonction pour nettoyer complètement les données de session
 */
const clearSessionData = () => {
  if (typeof window === 'undefined') return;

  console.log('🧹 Nettoyage des données de session...');
  
  // Supprimer les cookies d'authentification
  const cookiesToClear = [
    'access_token',
    'sb-access-token',
    'refresh_token',
    'user_id',
    'user_role'
  ];

  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  });

  // Nettoyer le stockage local
  localStorage.removeItem('access_token');
  localStorage.removeItem('supabase.auth.token');
  
  sessionStorage.clear();
  
  console.log('✅ Nettoyage terminé');
};

/**
 * Fonction pour vérifier si l'utilisateur a des tokens valides
 */
const hasValidTokens = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return !!(cookies['access_token'] || cookies['sb-access-token']);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fonction de déconnexion
  const signout = useCallback(async () => {
    try {
      console.log('🚪 Déconnexion en cours...');
      setUser(null);
      clearSessionData();
      
      // Appeler l'API de déconnexion
      try {
        await apiService.signout();
      } catch (error) {
        console.warn('⚠️ Erreur lors de la déconnexion API:', error);
      }
      
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  }, []);

  // Fonction de connexion
  const signin = async (email: string, password: string) => {
    try {
      console.log('🚀 Connexion en cours...');
      setIsLoading(true);
      
      const response: AuthResponse = await apiService.signin({ email, password });
      
      if (response.success && response.data.user) {
        const userData = {
          ...response.data.user,
          role: response.data.user.role || 'user'
        };
        
        // Mettre à jour immédiatement l'état utilisateur
        setUser(userData);
        console.log('✅ Connexion réussie:', userData.email);
        
        // Forcer la redirection immédiate
        console.log('🔄 Redirection forcée vers dashboard...');
        window.location.href = '/dashboard';
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const signup = async (userData: RegisterData) => {
    try {
      console.log('📝 Inscription en cours...');
      const response: AuthResponse = await apiService.signup(userData);
      
      if (response.success) {
        console.log('✅ Inscription réussie');
        router.push('/register/success');
      } else {
        throw new Error(response.message || 'Erreur d\'inscription');
      }
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      throw error;
    }
  };

  // Validation de session simplifiée
  const validateSession = useCallback(async () => {
    try {
      console.log('🔍 Validation de session...');
      
      // Vérifier si on a des tokens
      if (!hasValidTokens()) {
        console.log('❌ Aucun token trouvé');
        return false;
      }
      
      // Récupérer le profil utilisateur
      const userData = await apiService.getProfile();
      
      if (userData) {
        const completeUserData = {
          ...userData,
          role: userData.role || 'user'
        };
        
        setUser(completeUserData);
        console.log('✅ Session valide:', userData.email);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Erreur de validation:', error);
      
      // Si erreur 401, nettoyer la session
      if (error.message && error.message.includes('401')) {
        console.log('🔒 Session expirée, nettoyage...');
        clearSessionData();
        setUser(null);
      }
      
      return false;
    }
  }, []);

  // Initialisation de l'authentification
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔐 Initialisation de l\'authentification...');
        
        // Vérifier si on est sur une page publique
        const currentPath = window.location.pathname;
        const publicPaths = ['/', '/login', '/register', '/register/success', '/docs', '/pricing', '/apis', '/contact'];
        const isPublicPage = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));
        
        if (isPublicPage) {
          console.log('🌐 Page publique détectée');
          setIsLoading(false);
          return;
        }
        
        // Valider la session si on a des tokens
        if (hasValidTokens()) {
          await validateSession();
        } else {
          console.log('❌ Aucun token, utilisateur non connecté');
        }
      } catch (error) {
        console.error('💥 Erreur d\'initialisation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [validateSession]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    isLoading,
    signin,
    signup,
    signout,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 