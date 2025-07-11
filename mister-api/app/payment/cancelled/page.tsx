'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, AlertTriangle, ArrowLeft, Home, CreditCard, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';

export default function PaymentCancelledPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showError, showInfo } = useToastContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const paymentStatus = searchParams.get('payment');
    
    console.log('❌ Payment Cancelled Page - Paramètres:', { paymentStatus });

    // Afficher un message d'information
    if (paymentStatus === 'cancelled') {
      showInfo(
        'Paiement annulé', 
        'Vous avez annulé le processus de paiement. Aucun montant n\'a été débité.'
      );
    }

    // Simuler un délai de chargement pour l'effet visuel
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams, showInfo]);

  const handleRetryPayment = () => {
    router.push('/payment');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Vérification du paiement...</h2>
          <p className="text-gray-400">Veuillez patienter</p>
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
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
              <h1 className="text-xl font-bold text-white">Paiement Annulé</h1>
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
          {/* Icône d'annulation */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-900 rounded-full mb-6">
              <XCircle className="h-12 w-12 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Paiement Annulé
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Vous avez annulé le processus de paiement
            </p>
          </div>

          {/* Carte d'information */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-8 mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-400">Aucun Débit Effectué</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white mb-2">Ce qui s'est passé</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <XCircle className="h-4 w-4 text-yellow-400 mr-2" />
                    Vous avez fermé la page de paiement
                  </li>
                  <li className="flex items-center">
                    <XCircle className="h-4 w-4 text-yellow-400 mr-2" />
                    Aucun montant n'a été débité
                  </li>
                  <li className="flex items-center">
                    <XCircle className="h-4 w-4 text-yellow-400 mr-2" />
                    Votre compte reste en mode gratuit
                  </li>
                  <li className="flex items-center">
                    <XCircle className="h-4 w-4 text-yellow-400 mr-2" />
                    Vous pouvez réessayer à tout moment
                  </li>
                </ul>
              </div>
              
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white mb-2">Votre Statut Actuel</h3>
                <div className="space-y-2 text-gray-300">
                  <p><span className="text-gray-400">Plan :</span> <span className="text-gray-400 font-medium">Gratuit</span></p>
                  <p><span className="text-gray-400">Limite quotidienne :</span> <span className="text-white font-medium">1,000 appels</span></p>
                  <p><span className="text-gray-400">Limite par minute :</span> <span className="text-white font-medium">60 appels</span></p>
                  <p><span className="text-gray-400">Support :</span> <span className="text-gray-400 font-medium">Communautaire</span></p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-400 text-sm">
                Si vous rencontrez des problèmes avec le paiement, contactez notre support à <span className="text-white">support@mister-api.com</span>
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
              onClick={handleRetryPayment}
              className="flex items-center justify-center px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Réessayer le Paiement
            </button>
            
            <button
              onClick={handleGoToDashboard}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Retour au Dashboard
            </button>
            
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
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
              <h3 className="text-lg font-semibold text-white mb-4">Besoin d'aide ?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div>
                  <div className="bg-blue-900 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">📧</div>
                  <p>Contactez notre support par email</p>
                </div>
                <div>
                  <div className="bg-green-900 text-green-400 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">💳</div>
                  <p>Vérifiez vos informations de paiement</p>
                </div>
                <div>
                  <div className="bg-purple-900 text-purple-400 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">🔒</div>
                  <p>Assurez-vous que votre carte est valide</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Avantages Premium */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 rounded-lg p-6 border border-yellow-800/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Rappel des Avantages Premium</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="text-left">
                  <ul className="space-y-1">
                    <li>• Accès illimité à toutes les APIs</li>
                    <li>• 10,000 appels par jour</li>
                    <li>• Support prioritaire</li>
                  </ul>
                </div>
                <div className="text-left">
                  <ul className="space-y-1">
                    <li>• Fonctionnalités avancées</li>
                    <li>• Statistiques détaillées</li>
                    <li>• Mises à jour en priorité</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 