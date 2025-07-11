'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  CreditCard, 
  Shield, 
  Zap, 
  Users, 
  Clock,
  CheckCircle,
  Loader2,
  Star,
  Rocket,
  Headphones,
  Database,
  Globe
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiService } from '@/lib/api';

function PaymentContent() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToastContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [premiumPriceId, setPremiumPriceId] = useState<string>('price_1RiIyuQQFSQSRXWkrY9vgZa1'); // Fallback
  const [debugModal, setDebugModal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Logs de débogage pour l'authentification
  useEffect(() => {
    console.log('🔍 [PAYMENT] État de l\'authentification:', {
      user: user ? { id: user.id, email: user.email, is_premium: user.is_premium } : null,
      authLoading,
      isAuthenticated
    });
  }, [user, authLoading, isAuthenticated]);

  // Récupérer les prix disponibles au chargement
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const prices = await apiService.getPrices();
        if (prices && prices.length > 0) {
          // Utiliser le premier prix disponible
          setPremiumPriceId(prices[0].id);
          console.log('💰 [PAYMENT] Prix récupéré:', prices[0].id);
        }
      } catch (error) {
        console.log('💰 [PAYMENT] Utilisation du prix par défaut:', premiumPriceId);
      }
    };

    loadPrices();
  }, []);

  // Rediriger si l'utilisateur est déjà premium
  useEffect(() => {
    if (user?.is_premium) {
      showError('Déjà Premium', 'Vous êtes déjà un utilisateur premium !');
      router.push('/dashboard');
    }
  }, [user, router, showError]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const handleUpgradeToPremium = async () => {
    try {
      setIsLoading(true);
      setDebugModal(true);
      setDebugLogs([]);
      
      addDebugLog('🚀 [PAYMENT] Création de la session de paiement Premium...');
      addDebugLog(`🚀 [PAYMENT] Prix utilisé: ${premiumPriceId}`);
      addDebugLog(`🚀 [PAYMENT] Utilisateur: ${user?.id}`);
      addDebugLog(`🚀 [PAYMENT] API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
      addDebugLog(`🍪 [PAYMENT] Cookies disponibles: ${document.cookie}`);

      // Vérifier que l'utilisateur est connecté
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      // Test direct de l'endpoint
      addDebugLog('🔧 [PAYMENT] Test direct de l\'endpoint...');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mister-api.onrender.com';
      const endpoint = '/api/v1/payments/create-checkout-session';
      const url = `${baseUrl}${endpoint}`;
      addDebugLog(`🔧 [PAYMENT] URL construite: ${url}`);

      // Test direct de l'endpoint sans passer par l'API service
      addDebugLog('🔧 [PAYMENT] Test direct de l\'endpoint...');
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: premiumPriceId,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/payment?payment=cancelled`
        })
      });

      addDebugLog(`📡 [PAYMENT] Response status: ${response.status}`);
      addDebugLog(`📡 [PAYMENT] Response URL: ${response.url}`);
      addDebugLog(`📡 [PAYMENT] Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);

      if (!response.ok) {
        const errorText = await response.text();
        addDebugLog(`❌ [PAYMENT] Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const session = await response.json();
      addDebugLog('✅ [PAYMENT] Session créée:');
      addDebugLog(JSON.stringify(session, null, 2));
      
      if (session.url) {
        // Ouvrir Stripe dans une nouvelle fenêtre/onglet
        const stripeWindow = window.open(
          session.url,
          'stripe-checkout',
          'width=500,height=700,scrollbars=yes,resizable=yes'
        );

        if (!stripeWindow) {
          throw new Error('Impossible d\'ouvrir la fenêtre de paiement. Vérifiez que les popups ne sont pas bloqués.');
        }

        // Vérifier si la fenêtre a été fermée (paiement terminé)
        const checkClosed = setInterval(async () => {
          if (stripeWindow.closed) {
            clearInterval(checkClosed);
            console.log('✅ [PAYMENT] Fenêtre Stripe fermée - vérification du statut...');
            
            // Attendre un peu pour que le webhook soit traité
            setTimeout(async () => {
              try {
                // Recharger les données utilisateur pour vérifier le statut premium
                await apiService.getProfile();
                
                // Vérifier si l'utilisateur est maintenant premium
                const updatedUser = await apiService.getProfile();
                if (updatedUser.is_premium) {
                  console.log('✅ [PAYMENT] Utilisateur mis à jour vers Premium !');
                  showSuccess('Paiement réussi !', 'Votre compte a été mis à jour vers Premium.');
                  router.push('/dashboard?payment=success');
                } else {
                  console.log('⚠️ [PAYMENT] Utilisateur pas encore mis à jour, redirection...');
                  router.push('/dashboard?payment=pending');
                }
              } catch (error) {
                console.log('⚠️ [PAYMENT] Erreur lors de la vérification, redirection...');
                router.push('/dashboard?payment=pending');
              }
            }, 2000); // Attendre 2 secondes pour le webhook
          }
        }, 1000);
      } else {
        throw new Error('URL de session non disponible');
      }

    } catch (error: any) {
      addDebugLog(`❌ [PAYMENT] Erreur: ${error.message}`);
      addDebugLog(`❌ [PAYMENT] Stack: ${error.stack}`);
      console.error('❌ [PAYMENT] Erreur lors de la création de la session:', error);
      
      // Gestion spécifique des erreurs
      if (error.message?.includes('401') || error.message?.includes('Non authentifié')) {
        showError('Session expirée', 'Votre session a expiré. Veuillez vous reconnecter.');
        router.push('/login');
      } else if (error.message?.includes('popup')) {
        showError('Popup bloqué', 'Veuillez autoriser les popups pour ce site et réessayer.');
      } else {
        showError('Erreur', error.message || 'Impossible de créer la session de paiement');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { text: '150 000 appels par jours', icon: <Rocket className="h-4 w-4" />, highlight: true },
    { text: '100 appels par minute', icon: <Rocket className="h-4 w-4" />, highlight: true },
    { text: 'Support prioritaire 24/7', icon: <Headphones className="h-4 w-4" />, highlight: true },
    { text: 'Analytics avancées', icon: <Star className="h-4 w-4" />, highlight: true },
    { text: 'Webhooks personnalisés', icon: <Zap className="h-4 w-4" />, highlight: true },
    { text: 'SLA garanti 99.9%', icon: <Shield className="h-4 w-4" />, highlight: true },
    { text: 'Accès aux nouvelles APIs en avant-première', icon: <Star className="h-4 w-4" />, highlight: true },
    { text: 'Intégrations premium (Slack, Discord)', icon: <Check className="h-4 w-4" />, highlight: true }
  ];

  if (user?.is_premium) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center bg-gray-900 p-8 rounded-2xl border border-gray-700">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">Vous êtes déjà Premium !</h2>
          <p className="text-gray-400 mb-4">Redirection vers le dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Passez Premium
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Débloquez tout le potentiel de l'API Punchiline avec notre plan premium. 
              Tarifs simples et transparents, pas de frais cachés.
            </p>
          </motion.div>
        </div>

        {/* Carte Premium */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative p-8 rounded-2xl border flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 border-green-400 transform scale-105 shadow-2xl shadow-green-400/20">
            {/* Badge Premium */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-green-400 to-green-300 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg">
                <Star className="h-4 w-4" />
                <span>RECOMMANDÉ</span>
              </span>
            </div>

            {/* Header de la carte */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-r from-green-400 to-green-300 text-black shadow-lg">
                  <Crown className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">PREMIUM</h3>
              <p className="text-gray-400 mb-4">Pour les développeurs professionnels</p>
              
              {/* Quotas mis en avant */}
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-green-400 mr-1" />
                      <span className="text-xs text-gray-400">Par jour</span>
                    </div>
                    <div className="text-lg font-bold text-white">150 000 appels</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="h-4 w-4 text-green-400 mr-1" />
                      <span className="text-xs text-gray-400">Par minute</span>
                    </div>
                    <div className="text-lg font-bold text-white">100 appels</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">5€</span>
                <span className="text-gray-400">/mois</span>
              </div>
              <p className="text-green-400 font-semibold text-sm">
                Économisez 50% par rapport à la concurrence
              </p>
            </div>

            {/* Liste des fonctionnalités */}
            <ul className="space-y-4 mb-8 flex-grow">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center group text-white font-medium"
                >
                  <div className="mr-3 text-green-400">
                    {feature.icon}
                  </div>
                  <span className="flex-1">{feature.text}</span>
                  <span className="ml-2 bg-gradient-to-r from-green-400 to-green-300 text-black text-xs px-2 py-1 rounded-full font-bold">
                    PREMIUM
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Bouton d'action */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-auto"
            >
              <button
                onClick={handleUpgradeToPremium}
                disabled={isLoading}
                className="w-full block text-center py-4 px-6 rounded-lg font-semibold transition-all duration-300 cursor-pointer bg-gradient-to-r from-green-400 to-green-300 text-black hover:from-green-300 hover:to-green-200 text-lg font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Ouverture du paiement...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Commencer l'abonnement Premium
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Informations supplémentaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Performance</h3>
              <p className="text-gray-400 text-sm">
                Accès à des serveurs haute performance pour des réponses ultra-rapides
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <Headphones className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Support</h3>
              <p className="text-gray-400 text-sm">
                Support prioritaire avec réponse garantie sous 24h
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Sécurité</h3>
              <p className="text-gray-400 text-sm">
                99.9% de disponibilité garantie avec monitoring 24/7
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modale de débogage */}
      {debugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">🔧 Debug - Paiement</h3>
              <button
                onClick={() => setDebugModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm">
              {debugLogs.map((log, index) => (
                <div key={index} className="text-green-400 mb-1">
                  {log}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setDebugModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Payment() {
  return (
    <ProtectedRoute>
      <PaymentContent />
    </ProtectedRoute>
  );
} 