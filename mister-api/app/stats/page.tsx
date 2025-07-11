'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Activity, 
  TrendingUp, 
  Calendar,
  ArrowLeft,
  RefreshCw,
  Key,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useToastContext } from '../../components/ToastProvider';
import type { ApiKey, ApiKeyUsageStats } from '../../types';

function StatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showError } = useToastContext();
  
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [usageStats, setUsageStats] = useState<ApiKeyUsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger les clés API de l'utilisateur
  const loadApiKeys = async () => {
    try {
      console.log('📊 [STATS] Chargement des clés API...');
      setError(null);
      
      const keys = await apiService.getApiKeys();
      console.log('📊 [STATS] Clés API récupérées:', keys.length);
      setApiKeys(keys);
      
      // Sélectionner automatiquement la première clé si aucune n'est sélectionnée
      if (keys.length > 0 && !selectedApiKey) {
        setSelectedApiKey(keys[0].api_key);
      }
    } catch (error: any) {
      console.error('❌ [STATS] Erreur lors du chargement des clés API:', error);
      
      // Gestion spécifique des erreurs d'authentification
      if (error.message && error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Session expirée. Veuillez vous reconnecter.');
        showError('Erreur d\'authentification', 'Votre session a expiré. Veuillez vous reconnecter.');
        return;
      }
      
      setError('Impossible de charger vos clés API');
      showError('Erreur', 'Impossible de charger vos clés API');
    }
  };

  // Charger les statistiques pour la clé API sélectionnée
  const loadStatsData = async () => {
    if (!selectedApiKey) {
      console.log('📊 [STATS] Aucune clé API sélectionnée, impossible de charger les stats');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('📊 [STATS] Chargement des statistiques pour la clé:', selectedApiKey.substring(0, 10) + '...');
      
      // Trouver la clé API sélectionnée dans la liste
      const selectedKey = apiKeys.find(key => key.api_key === selectedApiKey);
      
      if (!selectedKey) {
        throw new Error('Clé API sélectionnée non trouvée');
      }
      
      console.log('📊 [STATS] Clé API trouvée:', selectedKey);
      
      // Récupérer les vraies statistiques d'utilisation depuis l'API
      const stats = await apiService.getApiKeyStats(selectedKey.id);
      console.log('📊 [STATS] Statistiques d\'utilisation récupérées:', stats);
      
      setUsageStats(stats);
      
    } catch (error: any) {
      console.error('❌ [STATS] Erreur lors du chargement des statistiques:', error);
      
      // Gestion spécifique des erreurs d'authentification
      if (error.message && error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Session expirée. Veuillez vous reconnecter.');
        showError('Erreur d\'authentification', 'Votre session a expiré. Veuillez vous reconnecter.');
        return;
      }
      
      setError('Impossible de charger les statistiques pour cette clé API');
      showError('Erreur', 'Impossible de charger les statistiques pour cette clé API');
      
      // En cas d'erreur, afficher des données vides
      setUsageStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (apiKey: string) => {
    console.log('📊 [STATS] Changement de clé API sélectionnée:', apiKey.substring(0, 10) + '...');
    setSelectedApiKey(apiKey);
    
    // Recharger automatiquement les statistiques pour la nouvelle clé
    setTimeout(() => {
      loadStatsData();
    }, 100);
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const initializeData = async () => {
      // Attendre que l'authentification soit terminée
      if (authLoading) return;
      
      if (!isAuthenticated) {
        console.log('📊 [STATS] Utilisateur non authentifié, redirection...');
        return;
      }
      
      await loadApiKeys();
      setIsLoading(false);
    };
    
    initializeData();
  }, [authLoading, isAuthenticated]);

  // Charger les stats quand une clé est sélectionnée
  useEffect(() => {
    if (selectedApiKey && apiKeys.length > 0) {
      loadStatsData();
    }
  }, [selectedApiKey, apiKeys]);

  // Afficher un loader pendant le chargement de l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Afficher un message d'erreur si il y en a un
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-green-400 text-black px-6 py-3 rounded-lg hover:bg-green-500 transition-colors font-semibold"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Retour au dashboard</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">Statistiques des appels API</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Sélection de clé API */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">Sélection de clé API</h2>
                <Key className="h-6 w-6 text-green-400" />
              </div>
              <button
                onClick={loadStatsData}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualiser</span>
              </button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="bg-gray-900 p-8 rounded-lg border border-gray-700 text-center">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Aucune clé API disponible
                </h3>
                <p className="text-gray-400 mb-4">
                  Vous devez créer une clé API pour pouvoir consulter vos statistiques d'utilisation.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-green-400 text-black px-4 py-2 rounded-md hover:bg-green-500 transition-colors font-semibold"
                >
                  Créer une clé API
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedApiKey === key.api_key
                        ? 'border-green-400 bg-gray-800'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                    onClick={() => handleApiKeyChange(key.api_key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{key.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        key.type === 'premium' 
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {key.type === 'premium' ? 'Premium' : 'Gratuit'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{key.table_name}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Clé: {key.api_key.substring(0, 10)}...
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Statistiques */}
          {selectedApiKey && usageStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* En-tête des statistiques */}
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Statistiques d'utilisation</h2>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">En temps réel</span>
                  </div>
                </div>
                <p className="text-gray-400">
                  Statistiques détaillées pour la clé API <strong>{usageStats.api_key_name}</strong>
                </p>
              </div>

              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total des appels */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-900 p-6 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                    <span className="text-2xl font-bold text-blue-400">{usageStats.total_calls}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Total des appels</h3>
                  <p className="text-gray-400 text-sm">Nombre total d'appels effectués</p>
                </motion.div>

                {/* Appels aujourd'hui */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-900 p-6 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="h-8 w-8 text-green-400" />
                    <span className="text-2xl font-bold text-green-400">{usageStats.calls_today}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Appels aujourd'hui</h3>
                  <p className="text-gray-400 text-sm">Appels effectués aujourd'hui</p>
                </motion.div>

                {/* Taux de réussite */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-900 p-6 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Target className="h-8 w-8 text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-400">
                      {usageStats.total_requests > 0 
                        ? Math.round((usageStats.successful_requests / usageStats.total_requests) * 100)
                        : 0}%
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Taux de réussite</h3>
                  <p className="text-gray-400 text-sm">Pourcentage d'appels réussis</p>
                </motion.div>

                {/* Temps de réponse moyen */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900 p-6 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="h-8 w-8 text-purple-400" />
                    <span className="text-2xl font-bold text-purple-400">
                      {Math.round(usageStats.average_response_time)}ms
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Temps de réponse</h3>
                  <p className="text-gray-400 text-sm">Temps de réponse moyen</p>
                </motion.div>
              </div>

              {/* Détails des statistiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appels réussis vs échoués */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-900 p-6 rounded-lg border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Répartition des appels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        <span className="text-white">Appels réussis</span>
                      </div>
                      <span className="text-green-400 font-semibold">{usageStats.successful_requests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                        <span className="text-white">Appels échoués</span>
                      </div>
                      <span className="text-red-400 font-semibold">{usageStats.failed_requests}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Informations de la clé API */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gray-900 p-6 rounded-lg border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Informations de la clé</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nom:</span>
                      <span className="text-white">{usageStats.api_key_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dernière utilisation:</span>
                      <span className="text-white">
                        {new Date(usageStats.last_request_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email utilisateur:</span>
                      <span className="text-white">{usageStats.user_email}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Message si aucune statistique */}
          {selectedApiKey && !usageStats && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900 p-8 rounded-lg border border-gray-700 text-center"
            >
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Aucune statistique disponible
              </h3>
              <p className="text-gray-400">
                Cette clé API n'a pas encore été utilisée ou les statistiques ne sont pas disponibles.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Stats() {
  return (
    <ProtectedRoute>
      <StatsContent />
    </ProtectedRoute>
  );
} 