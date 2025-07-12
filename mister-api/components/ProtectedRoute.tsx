'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Marquer comme initialisé après un délai pour éviter les redirections prématurées
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected) return;

    // Attendre que l'authentification soit initialisée ET que le composant soit prêt
    if (isLoading || !isInitialized) return;

    // Vérifier l'authentification
    if (!isAuthenticated) {
      // console.log('🔒 Access denied: User not authenticated, redirecting to login');
      setHasRedirected(true);
      router.push('/login');
      return;
    }

    // Vérifier les permissions admin si nécessaire
    if (requireAdmin && !isAdmin) {
      // console.log('🔒 Access denied: User not admin, redirecting to dashboard');
      setHasRedirected(true);
      router.push('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin, router, hasRedirected, isInitialized]);

  // Afficher un loader moderne pendant le chargement ou l'initialisation
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Logo et titre */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-green-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">Mister API</h1>
            </div>
            <p className="text-gray-400 text-sm">Sécurisation de votre accès</p>
          </motion.div>

          {/* Loader principal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <LoadingSpinner 
              size="xl" 
              color="green" 
              variant="dots"
              className="mb-4"
            />
          </motion.div>

          {/* Étapes de vérification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center space-x-3 text-sm">
              <Lock className="h-4 w-4 text-green-400" />
              <span className="text-gray-300">Vérification de l'authentification</span>
            </div>
            
            <div className="flex items-center justify-center space-x-3 text-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <div className="h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full" />
              </motion.div>
              <span className="text-gray-400">Validation de la session</span>
            </div>

            {requireAdmin && (
              <div className="flex items-center justify-center space-x-3 text-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                >
                  <div className="h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full" />
                </motion.div>
                <span className="text-gray-400">Vérification des permissions admin</span>
              </div>
            )}
          </motion.div>

          {/* Message de sécurité */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-lg max-w-sm mx-auto"
          >
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span>Connexion sécurisée par Supabase</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mb-4"
          >
            <div className="h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto" />
          </motion.div>
          <p className="text-gray-400 text-sm">
            Redirection vers la page de connexion...
          </p>
        </motion.div>
      </div>
    );
  }

  // Si la page nécessite des droits admin et que l'utilisateur n'est pas admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mb-4"
          >
            <div className="h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto" />
          </motion.div>
          <p className="text-gray-400 text-sm">
            Redirection vers le dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  // Afficher le contenu protégé
  return <>{children}</>;
} 