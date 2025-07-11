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

// Fonction pour nettoyer complètement les cookies et le stockage local
const clearAllSessionData = () => {
  if (typeof window === 'undefined') return;

  console.log('🧹 Clearing all session data...');
  
  // Liste de tous les cookies d'authentification à supprimer
  const cookiesToClear = [
    'access_token',
    'user_id',
    'user_role',
    'supabase.auth.token',
    'sb-iqblthgenholebudyvcx-auth-token'
  ];

  // Supprimer chaque cookie avec différentes options pour s'assurer qu'ils sont bien supprimés
  cookiesToClear.forEach(cookieName => {
    // Supprimer avec path=/
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Supprimer avec path=/ et domain=localhost
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    // Supprimer sans path spécifique
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  });

  // Nettoyer aussi le localStorage et sessionStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-iqblthgenholebudyvcx-auth-token');
    console.log('🧹 LocalStorage cleared');
  }
  
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
    console.log('🧹 SessionStorage cleared');
  }
  
  console.log('🧹 Session cleanup complete');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Fonction de déconnexion sécurisée
  const signout = useCallback(async () => {
    try {
      console.log('🚪 Signing out user');
      await apiService.signout();
    } catch (error) {
      console.error('❌ Signout error:', error);
    } finally {
      setUser(null);
      console.log('✅ User signed out, state cleared');
      
      // Nettoyer complètement les données de session
      clearAllSessionData();
      
      // Forcer la redirection vers la page de connexion avec rechargement complet
      if (typeof window !== 'undefined') {
        console.log('🚪 Redirecting to login page with full reload...');
        window.location.href = '/login';
      }
    }
  }, []);

  // Fonction de validation de session
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Validating session...');
      
      // Vérifier d'abord s'il y a un token dans le localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('🔑 No token found in localStorage');
          return false;
        }
        console.log('🔑 Token found in localStorage, validating with server...');
      }
      
      // Essayer de récupérer le profil utilisateur
      const userData = await apiService.getProfile();
      console.log('✅ Session valid, user data:', userData);
      setUser(userData);
      return true;
    } catch (error: any) {
      console.error('❌ Session validation failed:', error);
      
      // Si c'est une erreur 401 (non autorisé), la session est invalide
      if (error.message && error.message.includes('401')) {
        console.log('🔒 Session expired (401) - clearing localStorage');
        // Nettoyer le localStorage en cas de session expirée
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        return false;
      }
      
      // Si c'est une erreur réseau, ne pas considérer comme invalide
      if (error.message && (
        error.message.includes('Serveur indisponible') ||
        error.message.includes('Erreur de connexion au serveur') ||
        error.message.includes('fetch')
      )) {
        console.log('🌐 Network error, keeping current session state');
        return false;
      }
      
      // Pour les autres erreurs, considérer comme invalide
      console.log('❌ Other error, session invalid');
      return false;
    }
  }, []);

  // Vérification automatique de l'authentification au démarrage
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...');
        
        // Vérifier d'abord s'il y a un token dans le localStorage
        let hasToken = false;
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          hasToken = !!token;
          console.log(`🔑 Token in localStorage: ${hasToken ? 'Found' : 'Not found'}`);
        }
        
        // Vérifier si on est sur une page publique (pas besoin de vérifier l'auth)
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/', '/login', '/register', '/register/success', '/docs', '/pricing'];
          
          // Vérifier si c'est une page publique
          const isPublicPage = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));
          
          if (isPublicPage) {
            console.log('🌐 Public page detected, skipping auth check');
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }
        }
        
        // Si on a un token, essayer de valider la session
        if (hasToken) {
          console.log('🔍 Token found, validating session...');
          const isValid = await validateSession();
          
          if (isValid && isMounted) {
            console.log('✅ Valid session found, user authenticated');
          } else if (!isValid && isMounted) {
            console.log('📭 Invalid session, redirecting to login');
            // Rediriger vers la page de connexion si on est sur une page protégée
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname;
              const protectedPaths = ['/dashboard', '/payment'];
              if (protectedPaths.some(path => currentPath.startsWith(path))) {
                console.log('🔄 Redirecting to login page');
                router.push('/login');
              }
            }
          }
        } else {
          console.log('📭 No token found, redirecting to login');
          // Pas de token, rediriger vers la page de connexion si on est sur une page protégée
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const protectedPaths = ['/dashboard', '/payment'];
            if (protectedPaths.some(path => currentPath.startsWith(path))) {
              console.log('🔄 Redirecting to login page');
              router.push('/login');
            }
          }
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (isMounted) {
          // En cas d'erreur, nettoyer et rediriger seulement si on est sur une page protégée
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const protectedPaths = ['/dashboard', '/payment'];
            if (protectedPaths.some(path => currentPath.startsWith(path))) {
              await signout();
            }
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
          console.log('🏁 Auth initialization complete');
        }
      }
    };

    // Délai pour s'assurer que l'API est prête
    const timer = setTimeout(initializeAuth, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router, validateSession, signout]);

  // Vérification périodique de la session (seulement après l'initialisation)
  useEffect(() => {
    if (!isInitialized || !user) return;

    let isMounted = true;

    const checkSession = async () => {
      try {
        // Vérifier périodiquement si la session est toujours valide
        await apiService.getProfile();
      } catch (error) {
        console.log('⚠️ Session expired, signing out...');
        
        if (isMounted) {
          console.log('❌ Session invalid, signing out...');
          await signout();
        }
      }
    };

    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, router, isInitialized, signout]);

  const signin = async (email: string, password: string) => {
    try {
      console.log('🚀 Starting signin process...');
      const response: AuthResponse = await apiService.signin({ email, password });
      
      console.log('✅ Signin successful:', response);
      
      if (response.success && response.data.user) {
        // Récupérer les données complètes du profil depuis public.users
        console.log('📋 Fetching complete user profile...');
        try {
          const profileData = await apiService.getProfile();
          console.log('✅ Complete profile data:', profileData);
          setUser(profileData);
        } catch (profileError) {
          console.warn('⚠️ Could not fetch complete profile, using auth data:', profileError);
          // En cas d'erreur, utiliser les données de auth.users
          setUser(response.data.user);
        }
        
        console.log('👤 User state updated with complete profile');
        // Rediriger vers le dashboard après connexion réussie
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Signin failed');
      }
    } catch (error: any) {
      console.error('❌ Signin error:', error);
      
      // Gestion spécifique des erreurs réseau
      if (error.message && error.message.includes('Serveur indisponible')) {
        throw new Error('Serveur backend indisponible - Veuillez vérifier que le serveur est démarré sur http://localhost:3001');
      }
      
      if (error.message && error.message.includes('Erreur de connexion au serveur')) {
        throw new Error('Impossible de se connecter au serveur - Vérifiez votre connexion internet et que le backend est démarré');
      }
      
      throw error;
    }
  };

  const signup = async (userData: RegisterData) => {
    try {
      console.log('📝 Attempting signup for:', userData.email);
      const response: AuthResponse = await apiService.signup(userData);
      
      console.log('✅ Signup successful:', response);
      
      // Ne pas connecter automatiquement l'utilisateur après l'inscription
      // L'utilisateur doit d'abord confirmer son email
      if (response.success) {
        console.log('📧 User registered successfully, email confirmation required');
        // Rediriger vers la page de succès
        router.push('/register/success');
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  };

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