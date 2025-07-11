'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Crown, 
  CreditCard, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Settings,
  ArrowLeft,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { apiService } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, signout } = useAuth();
  const { showSuccess, showError, showInfo } = useToastContext();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadPayments(),
        loadSubscriptions()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      showError('Erreur', 'Impossible de charger les données du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setIsLoadingPayments(true);
      const paymentsData = await apiService.getMyPayments();
      setPayments(paymentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      // Ne pas afficher d'erreur car les paiements peuvent ne pas être disponibles
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const subscriptionsData = await apiService.getUserSubscriptions();
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
      // Ne pas afficher d'erreur car les abonnements peuvent ne pas être disponibles
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'active':
        return 'text-green-400';
      case 'pending':
      case 'incomplete':
        return 'text-yellow-400';
      case 'failed':
      case 'canceled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
      case 'incomplete':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'failed':
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100); // Stripe utilise les centimes
  };

  const handleRefresh = () => {
    loadProfileData();
    showSuccess('Actualisé', 'Données du profil actualisées');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToPayment = () => {
    router.push('/payment');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="bg-gray-900 shadow-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGoBack}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-400" />
                </button>
                <User className="h-8 w-8 text-green-400" />
                <h1 className="text-xl font-bold text-white">Mon Profil</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw className="h-5 w-5 text-gray-400" />
                </button>
                <button
                  onClick={handleGoToDashboard}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Informations Utilisateur */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-400 p-3 rounded-full">
                    <User className="h-8 w-8 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {user?.prenom && user?.nom 
                        ? `${user.prenom} ${user.nom}`
                        : user?.prenom 
                        ? user.prenom
                        : user?.nom 
                        ? user.nom
                        : user?.email?.split('@')[0] || 'Utilisateur'
                      }
                    </h2>
                    <p className="text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.is_premium && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900 text-yellow-400">
                      <Crown className="h-4 w-4 mr-1" />
                      Premium
                    </span>
                  )}
                  <button
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    title={showSensitiveData ? "Masquer les données sensibles" : "Afficher les données sensibles"}
                  >
                    {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-gray-400" />
                    Contact
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-gray-400">Email :</span> {user?.email}</p>
                    {user?.telephone && (
                      <p><span className="text-gray-400">Téléphone :</span> {showSensitiveData ? user.telephone : '*** *** ** **'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                    Adresse
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    {user?.adresse_postale && (
                      <p><span className="text-gray-400">Adresse :</span> {showSensitiveData ? user.adresse_postale : '***'}</p>
                    )}
                    {user?.code_postal && user?.ville && (
                      <p><span className="text-gray-400">Ville :</span> {user.code_postal} {user.ville}</p>
                    )}
                    {user?.pays && (
                      <p><span className="text-gray-400">Pays :</span> {user.pays}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    Informations
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-gray-400">Membre depuis :</span> {formatDate(user?.created_at || '')}</p>
                    {user?.date_naissance && (
                      <p><span className="text-gray-400">Date de naissance :</span> {formatDate(user.date_naissance)}</p>
                    )}
                    <p><span className="text-gray-400">Rôle :</span> <span className="capitalize">{user?.role || 'user'}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statut Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Crown className="h-6 w-6 mr-2 text-yellow-400" />
                  Statut Premium
                </h2>
                {!user?.is_premium && (
                  <button
                    onClick={handleGoToPayment}
                    className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                  >
                    Passer Premium
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Plan Actuel</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="text-gray-400">Statut :</span> 
                      <span className={`ml-2 font-medium ${user?.is_premium ? 'text-green-400' : 'text-gray-400'}`}>
                        {user?.is_premium ? 'Premium Actif' : 'Gratuit'}
                      </span>
                    </p>
                    {user?.premium_expires_at && (
                      <p>
                        <span className="text-gray-400">Expire le :</span> 
                        <span className="ml-2 font-medium text-white">
                          {formatDate(user.premium_expires_at)}
                        </span>
                      </p>
                    )}
                    <p>
                      <span className="text-gray-400">Limite quotidienne :</span> 
                      <span className="ml-2 font-medium text-white">
                        {user?.is_premium ? '10,000 appels' : '1,000 appels'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Avantages</h3>
                  <div className="space-y-2 text-gray-300">
                    {user?.is_premium ? (
                      <>
                        <p className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          Accès illimité à toutes les APIs
                        </p>
                        <p className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          Support prioritaire
                        </p>
                        <p className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          Fonctionnalités avancées
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center">
                          <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                          Accès limité aux APIs
                        </p>
                        <p className="flex items-center">
                          <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                          Support communautaire
                        </p>
                        <p className="flex items-center">
                          <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                          Fonctionnalités de base
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Abonnements */}
          {subscriptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CreditCard className="h-6 w-6 mr-2 text-blue-400" />
                  Mes Abonnements
                </h2>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(subscription.status)}
                          <span className={`font-medium ${getStatusColor(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">ID: {subscription.id}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">Début :</span>
                          <p>{formatDate(new Date(subscription.currentPeriodStart * 1000).toISOString())}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Fin :</span>
                          <p>{formatDate(new Date(subscription.currentPeriodEnd * 1000).toISOString())}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Renouvellement :</span>
                          <p className={subscription.cancelAtPeriodEnd ? 'text-red-400' : 'text-green-400'}>
                            {subscription.cancelAtPeriodEnd ? 'Annulé' : 'Automatique'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Historique des Paiements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <CreditCard className="h-6 w-6 mr-2 text-green-400" />
                  Historique des Paiements
                </h2>
                {isLoadingPayments && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                )}
              </div>

              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className={`font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">Description :</span>
                          <p>{payment.description}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Date :</span>
                          <p>{formatDate(payment.created_at)}</p>
                        </div>
                      </div>
                      {payment.stripe_payment_intent_id && (
                        <div className="mt-2 text-xs text-gray-500">
                          Payment Intent: {showSensitiveData ? payment.stripe_payment_intent_id : '***'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Aucun paiement
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Vous n'avez pas encore effectué de paiement.
                  </p>
                  {!user?.is_premium && (
                    <button
                      onClick={handleGoToPayment}
                      className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                    >
                      Passer Premium
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 