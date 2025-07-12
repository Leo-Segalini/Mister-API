'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { apiService } from '@/lib/api';
import { event } from '@/lib/gtag';


// Fonction utilitaire pour nettoyer les cookies et le stockage
const clearAllSessionData = (): void => {
  if (typeof window === 'undefined') return;
  
  // // console.log('🧹 [LOGIN] Nettoyage complet des données de session');
  
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
    
    // // console.log('✅ [LOGIN] Nettoyage terminé avec succès');
  } catch (error) {
    console.error('❌ [LOGIN] Erreur lors du nettoyage:', error);
  }
};

export default function Login() {
  const router = useRouter();
  const { signin, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('✅ [LOGIN] Utilisateur déjà connecté, redirection vers dashboard');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

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

    // Validation du mot de passe
    if (formData.password.length < 6) {
      showError('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    setEmailNotConfirmed(false);

    try {
      // // console.log('🚀 Starting login process...');
      await signin(formData.email, formData.password);
      
      // // console.log('✅ Login successful, showing success message');
      showSuccess('Connexion réussie !', 'Bienvenue sur Mister API !');
      
      // Tracker l'événement de connexion réussie
      event({
        action: 'login',
        category: 'authentication',
        label: 'success'
      });
      
      // Rediriger vers le dashboard après un délai
      setTimeout(() => {
        // // console.log('🔄 Redirecting to dashboard...');
        router.push('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Gestion spécifique des erreurs
      let errorMessage = 'Erreur lors de la connexion';
      let errorTitle = 'Erreur de connexion';
      
      if (error.message === 'EMAIL_NOT_CONFIRMED') {
        setEmailNotConfirmed(true);
        errorMessage = 'Votre email n\'est pas encore confirmé. Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation.';
        errorTitle = 'Email non confirmé';
      } else if (error.message) {
        // Gestion des erreurs réseau
        if (error.message.includes('Serveur indisponible') || 
            error.message.includes('Serveur backend indisponible')) {
          errorMessage = 'Le serveur backend n\'est pas accessible. Veuillez réessayer plus tard.';
          errorTitle = 'Serveur indisponible';
        } else if (error.message.includes('Impossible de se connecter au serveur') ||
                   error.message.includes('Erreur de connexion au serveur')) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.';
          errorTitle = 'Erreur de connexion';
        } else if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid email or password') ||
            error.message.includes('Email ou mot de passe incorrect')) {
          errorMessage = 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
          errorTitle = 'Identifiants incorrects';
        } else if (error.message.includes('Email not confirmed') || 
                   error.message.includes('email_confirmed_at')) {
          setEmailNotConfirmed(true);
          errorMessage = 'Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.';
          errorTitle = 'Email non confirmé';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Aucun compte trouvé avec cette adresse email. Vérifiez votre adresse ou créez un compte.';
          errorTitle = 'Compte non trouvé';
        } else if (error.message.includes('Too many requests') || 
                   error.message.includes('rate limit')) {
          errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.';
          errorTitle = 'Trop de tentatives';
        } else if (error.message.includes('Non autorisé')) {
          errorMessage = 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
          errorTitle = 'Identifiants incorrects';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Tracker l'événement de connexion échouée
      event({
        action: 'login',
        category: 'authentication',
        label: 'error'
      });
      
      showError(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      showError('Erreur', 'Veuillez d\'abord saisir votre adresse email');
      return;
    }

    setIsResendingEmail(true);

    try {
      await apiService.resendConfirmationEmail(formData.email);
      showSuccess('Email envoyé !', 'Un nouvel email de confirmation a été envoyé à votre adresse.');
    } catch (error: any) {
      console.error('❌ Error resending confirmation email:', error);
      showError('Erreur', 'Impossible d\'envoyer l\'email de confirmation. Veuillez réessayer.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

        
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
            <h2 className="text-3xl font-bold text-green-400">Connexion</h2>
              <p className="mt-2 text-gray-400">
                Connectez-vous à votre compte Mister API
              </p>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 z-10" />
                </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                  autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-700 placeholder-gray-400 text-white bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                  placeholder="exemple@email.com"
                  disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 z-10" />
                </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-700 placeholder-gray-400 text-white bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                  placeholder="Entrez votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Message d'email non confirmé */}
          {emailNotConfirmed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <RefreshCw className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-400">
                    Email non confirmé
                  </h3>
                  <p className="mt-1 text-sm text-yellow-300">
                    Votre email n'est pas encore confirmé. Vérifiez votre boîte de réception et cliquez sur le lien de confirmation.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isResendingEmail}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResendingEmail ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Renvoyer l\'email de confirmation'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-green-400 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Pas encore de compte ?{' '}
              <Link 
                href="/register" 
                className="font-medium text-green-400 hover:text-green-300 transition-colors"
              >
                Créer un compte
                </Link>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
  );
} 