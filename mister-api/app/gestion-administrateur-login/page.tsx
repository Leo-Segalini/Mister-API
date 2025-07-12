'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { apiService } from '@/lib/api';
import { event } from '@/lib/gtag';

// Fonction utilitaire pour nettoyer les cookies et le stockage
const clearAllSessionData = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Supprimer tous les cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Nettoyer localStorage
    localStorage.clear();
    
    // Nettoyer sessionStorage
    sessionStorage.clear();
    
    // Supprimer spécifiquement les cookies d'authentification
    const authCookies = [
      'sb-access-token',
      'supabase.auth.token',
      'auth-token',
      'session-token'
    ];
    
    authCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });
  } catch (error) {
    console.error('❌ [ADMIN LOGIN] Erreur lors du nettoyage:', error);
  }
};

export default function AdminLogin() {
  const router = useRouter();
  const { signin, isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Nettoyer les cookies au chargement de la page
  useEffect(() => {
    clearAllSessionData();
  }, []);

  // Rediriger si déjà connecté et admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.email || !formData.password) {
      showError('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Erreur', 'Veuillez saisir une adresse email valide');
      return;
    }

    setIsLoading(true);

    try {
      await signin(formData.email, formData.password);
      
      // Vérifier si l'utilisateur est admin
      if (user?.role !== 'admin') {
        showError('Accès refusé', 'Vous n\'avez pas les droits d\'administration nécessaires');
        return;
      }
      
      // Tracker l'événement de connexion admin réussie
      event({
        action: 'admin_login',
        category: 'authentication',
        label: 'success'
      });
      
      showSuccess('Connexion réussie !', 'Bienvenue dans l\'administration !');
      
      // Rediriger vers la page admin
      setTimeout(() => {
        router.push('/admin');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      
      // Tracker l'événement de connexion admin échouée
      event({
        action: 'admin_login',
        category: 'authentication',
        label: 'error'
      });
      
      // Gestion spécifique des erreurs
      let errorMessage = 'Erreur lors de la connexion';
      let errorTitle = 'Erreur de connexion';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid email or password')) {
          errorMessage = 'Email ou mot de passe incorrect.';
          errorTitle = 'Identifiants incorrects';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Aucun compte administrateur trouvé avec cette adresse email.';
          errorTitle = 'Compte non trouvé';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.';
          errorTitle = 'Trop de tentatives';
        } else {
          errorMessage = error.message;
        }
      }
      
      showError(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-purple-400">Administration</h2>
            <p className="mt-2 text-gray-300">
              Connexion sécurisée pour les administrateurs
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email administrateur
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pl-12 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 bg-gray-800/50 text-white placeholder-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="admin@mister-api.com"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 bg-gray-800/50 text-white placeholder-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Se connecter</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Avertissement de sécurité */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-400 font-medium mb-1">Zone sécurisée</p>
                  <p className="text-gray-300">
                    Cette page est réservée aux administrateurs autorisés. 
                    Toute tentative d'accès non autorisé sera enregistrée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lien de retour */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 