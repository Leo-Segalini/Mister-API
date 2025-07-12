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

  // console.log('🧹 Clearing all session data...');
  
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
    // console.log('🧹 LocalStorage cleared');
  }
  
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
    // console.log('🧹 SessionStorage cleared');
  }
  
  // console.log('🧹 Session cleanup complete');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false); // Nouvel état pour éviter les conflits
  const router = useRouter();

  // Fonction de déconnexion sécurisée
  const signout = useCallback(async () => {
    try {
      // console.log('🚪 Signing out user');
      await apiService.signout();
    } catch (error) {
      console.error('❌ Signout error:', error);
    } finally {
      setUser(null);
      // console.log('✅ User signed out, state cleared');
      
      // Nettoyer complètement les données de session
      clearAllSessionData();
      
      // Forcer la redirection vers la page de connexion avec rechargement complet
      if (typeof window !== 'undefined') {
        // console.log('🚪 Redirecting to login page with full reload...');
        window.location.href = '/login';
      }
    }
  }, []);

  // Fonction pour extraire les cookies de session
  const getSessionCookies = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return {
      accessToken: cookies['access_token'] || cookies['sb-access-token'],
      hasCookies: !!(cookies['access_token'] || cookies['sb-access-token'])
    };
  }, []);

  // Fonction de validation de session
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Validating session...');
      
      // Vérifier d'abord s'il y a des cookies de session
      const sessionCookies = getSessionCookies();
      if (!sessionCookies || !sessionCookies.hasCookies) {
        console.log('🍪 No session cookies found');
        return false;
      }
      
      console.log('🍪 Session cookies found:', {
        hasAccessToken: !!sessionCookies.accessToken,
        cookieLength: sessionCookies.accessToken?.length || 0
      });
      
      // Validation de session simplifiée (profil mis en commentaire)
      console.log('✅ Session validation simplified - using existing user data');
      
      // Si on a déjà un utilisateur en état, le considérer comme valide
      if (user) {
        console.log('✅ Using existing user data for session validation');
        return true;
      }
      
      // Sinon, essayer de récupérer le profil (fallback)
      try {
        const userData = await apiService.getProfile();
        console.log('✅ Session valid, user data:', userData);
        
        const completeUserData = {
          ...userData,
          role: userData.role || 'user'
        };
        
        setUser(completeUserData);
        return true;
      } catch (error) {
        console.warn('⚠️ Profile fetch failed, session may be invalid:', error);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Session validation failed:', error);
      
      // Si c'est une erreur 401 (non autorisé), la session est invalide
      if (error.message && error.message.includes('401')) {
        console.log('🔒 Session expired (401) - clearing cookies');
        // Nettoyer les cookies en cas de session expirée
        if (typeof window !== 'undefined') {
          // Supprimer les cookies de session avec tous les domaines possibles
          const domains = ['', '.vercel.app', '.mister-api.vercel.app'];
          const paths = ['/', ''];
          
          domains.forEach(domain => {
            paths.forEach(path => {
              document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
              document.cookie = `sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
            });
          });
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
  }, [getSessionCookies]);

  // Vérification automatique de l'authentification au démarrage
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...');
        
        // Ne pas initialiser si une connexion est en cours
        if (isSigningIn) {
          console.log('⏳ Signin in progress, skipping initialization');
          return;
        }
        
        // Vérifier d'abord s'il y a des cookies de session
        let hasCookies = false;
        if (typeof window !== 'undefined') {
          const sessionCookies = getSessionCookies();
          hasCookies = sessionCookies?.hasCookies || false;
          console.log(`🍪 Session cookies: ${hasCookies ? 'Found' : 'Not found'}`);
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
        
        // Si on a des cookies, essayer de valider la session
        if (hasCookies) {
          console.log('🔍 Cookies found, validating session...');
          const isValid = await validateSession();
          
          if (isValid && isMounted) {
            console.log('✅ Valid session found, user authenticated');
          } else if (!isValid && isMounted) {
            console.log('📭 Invalid session, but not redirecting automatically');
            // Ne pas rediriger automatiquement, laisser l'utilisateur gérer
          }
        } else {
          console.log('📭 No cookies found, but not redirecting automatically');
          // Ne pas rediriger automatiquement, laisser l'utilisateur gérer
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (isMounted) {
          // En cas d'erreur, ne pas nettoyer automatiquement
          // Laisser l'utilisateur essayer de se reconnecter
          console.log('⚠️ Auth initialization error, keeping current state');
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
  }, [router, validateSession, isSigningIn]);

  // Désactiver la vérification périodique de session pour éviter les déconnexions automatiques
  // useEffect(() => {
  //   if (!isInitialized || !user) return;
  //   // Vérification périodique désactivée pour éviter les déconnexions automatiques
  // }, [user, router, isInitialized, signout]);

  const signin = async (email: string, password: string) => {
    try {
      console.log('🚀 Starting signin process...');
      setIsSigningIn(true); // Marquer qu'une connexion est en cours
      
      const response: AuthResponse = await apiService.signin({ email, password });
      
      console.log('✅ Signin successful:', response);
      
      if (response.success && response.data.user) {
        // Utiliser directement les données d'authentification (profil mis en commentaire)
        console.log('📋 Using auth data directly (profile fetch commented out)...');
        
        // Utiliser les données de auth.users avec rôle par défaut
        const userData = {
          ...response.data.user,
          role: response.data.user.role || 'user'
        };
        
        console.log('👤 User data from auth:', userData);
        setUser(userData);
        
        console.log('👤 User state updated with complete profile');
        // Rediriger vers le dashboard après connexion réussie
        console.log('🔄 Redirecting to dashboard...');
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
    } finally {
      setIsSigningIn(false); // Marquer que la connexion est terminée
    }
  };

  const signup = async (userData: RegisterData) => {
    try {
      // console.log('📝 Attempting signup for:', userData.email);
      const response: AuthResponse = await apiService.signup(userData);
      
      // console.log('✅ Signup successful:', response);
      
      // Ne pas connecter automatiquement l'utilisateur après l'inscription
      // L'utilisateur doit d'abord confirmer son email
      if (response.success) {
        // console.log('📧 User registered successfully, email confirmation required');
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