'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Crown, ArrowRight, Home, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signout } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const sessionIdParam = searchParams.get('session_id');
    const paymentStatus = searchParams.get('payment');
    
    console.log('🎉 Payment Success Page - Paramètres:', { sessionIdParam, paymentStatus });

    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }

    // Afficher un message de succès
    if (paymentStatus === 'success') {
      showSuccess(
        'Paiement réussi !', 
        'Votre abonnement Premium est maintenant actif. Bienvenue dans l\'élite !'
      );
    }

    // Simuler un délai de chargement pour l'effet visuel
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, showSuccess]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-green-400 mb-2">Activation de votre Premium...</h2>
          <p className="text-gray-400">Veuillez patienter pendant que nous finalisons votre abonnement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Crown className="h-8 w-8 text-yellow-400" />
              <h1 className="text-xl font-bold text-white">Paiement Réussi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Bonjour, <span className="text-green-400 font-medium">{user?.prenom || user?.email?.split('@')[0] || 'Utilisateur'}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Icône de succès */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-900 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Paiement Réussi !
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Votre abonnement Premium est maintenant actif
            </p>
          </div>

          {/* Carte de confirmation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-8 mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-8 w-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-400">Premium Activé</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white mb-2">Vos Avantages Premium</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Accès illimité à toutes les APIs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Quotas augmentés (10,000 appels/jour)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Support prioritaire
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Fonctionnalités avancées
                  </li>
                </ul>
              </div>
              
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white mb-2">Informations de Paiement</h3>
                <div className="space-y-2 text-gray-300">
                  <p><span className="text-gray-400">Statut :</span> <span className="text-green-400 font-medium">Actif</span></p>
                  <p><span className="text-gray-400">Plan :</span> <span className="text-yellow-400 font-medium">Premium</span></p>
                  {user?.premium_expires_at && (
                    <p>
                      <span className="text-gray-400">Expire le :</span> 
                      <span className="text-white font-medium">
                        {new Date(user.premium_expires_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </p>
                  )}
                  {sessionId && (
                    <p><span className="text-gray-400">Session ID :</span> <span className="text-gray-500 text-sm">{sessionId}</span></p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-400 text-sm">
                Un email de confirmation a été envoyé à <span className="text-white">{user?.email}</span>
              </p>
            </div>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={handleGoToDashboard}
              className="flex items-center justify-center px-6 py-3 bg-green-400 text-black font-semibold rounded-lg hover:bg-green-500 transition-colors"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Aller au Dashboard
            </button>
            
            <button
              onClick={handleGoToProfile}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User className="h-5 w-5 mr-2" />
              Voir mon Profil
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Accueil
            </button>
          </motion.div>

          {/* Informations supplémentaires */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Prochaines Étapes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div>
                  <div className="bg-green-900 text-green-400 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">1</div>
                  <p>Explorez votre dashboard pour voir vos nouvelles fonctionnalités</p>
                </div>
                <div>
                  <div className="bg-blue-900 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">2</div>
                  <p>Créez vos clés API pour commencer à utiliser les services</p>
                </div>
                <div>
                  <div className="bg-purple-900 text-purple-400 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">3</div>
                  <p>Consultez la documentation pour découvrir toutes les APIs</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 