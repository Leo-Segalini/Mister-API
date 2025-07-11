'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Code, 
  Key, 
  Activity, 
  BarChart3, 
  Settings, 
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  User,
  Crown,
  TrendingUp,
  Calendar,
  BookOpen,
  Globe,
  PawPrint,
  Database,
  Zap,
  Clock,
  AlertTriangle,
  Webhook,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Tag,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToastContext } from '@/components/ToastProvider';
import type { ApiKey, QuotaInfo, Citation, Animal, Pays } from '@/types';
import ApiExplorerCard from './ApiExplorerCard';
import ActionCard from './ActionCard';
import CreateApiKeyModal from './CreateApiKeyModal';

interface DashboardInfoProps {
  user: any;
  isAdmin: boolean;
}

export default function DashboardInfo({ user, isAdmin }: DashboardInfoProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  
  // États pour les données - Initialiser apiKeys comme un tableau vide
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  
  // États pour les modales
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  
  // États pour les exemples d'APIs
  const [randomCitation, setRandomCitation] = useState<Citation | null>(null);
  const [randomAnimal, setRandomAnimal] = useState<Animal | null>(null);
  const [randomPays, setRandomPays] = useState<Pays | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('📊 [DASHBOARD] loadDashboardData - Début du chargement');
    
    try {
      setIsLoading(true);
      
      // Charger les clés API existantes
      console.log('📊 [DASHBOARD] Appel de apiService.getApiKeys()');
      const apiKeysData = await apiService.getApiKeys();
      console.log('📊 [DASHBOARD] Réponse de getApiKeys():', apiKeysData);
      console.log('📊 [DASHBOARD] Type de apiKeysData:', typeof apiKeysData);
      console.log('📊 [DASHBOARD] Est-ce un tableau?', Array.isArray(apiKeysData));
      
      // S'assurer que apiKeysData est un tableau
      const safeApiKeysData = Array.isArray(apiKeysData) ? apiKeysData : [];
      console.log('📊 [DASHBOARD] Nombre de clés API après vérification:', safeApiKeysData.length);
      
      setApiKeys(safeApiKeysData);
      console.log('📊 [DASHBOARD] État apiKeys mis à jour avec:', safeApiKeysData.length, 'clés');

      // Charger les autres données seulement si on a des clés API
      if (safeApiKeysData.length > 0) {
        console.log('📊 [DASHBOARD] Chargement des données supplémentaires car clés API trouvées');
        try {
          // Ne charger que les données qui ne nécessitent pas de clé API
          // Les données qui nécessitent une clé API seront chargées à la demande
          console.log('📊 [DASHBOARD] Données supplémentaires chargées avec succès');
          
          // Pour l'instant, on ne charge pas les données qui nécessitent une clé API
          // car elles causent des erreurs dans le dashboard
          // setQuotaInfo(quotaData);
          // setRandomCitation(citationData);
          // setRandomAnimal(animalData);
          // setRandomPays(paysData);
        } catch (apiError) {
          console.error('📊 [DASHBOARD] Erreur lors du chargement des données API:', apiError);
          // Ne pas afficher d'erreur car c'est normal si l'utilisateur n'a pas encore utilisé sa clé
        }
      } else {
        console.log('📊 [DASHBOARD] Aucune clé API trouvée, pas de chargement de données supplémentaires');
      }
      
    } catch (error: any) {
      console.error('📊 [DASHBOARD] ❌ Erreur dans loadDashboardData:', error);
      console.error('📊 [DASHBOARD] Détails de l\'erreur:', {
        message: error.message,
        stack: error.stack
      });
      showError('Erreur', 'Impossible de charger les données du dashboard');
      // En cas d'erreur, s'assurer que apiKeys reste un tableau vide
      setApiKeys([]);
    } finally {
      console.log('📊 [DASHBOARD] Fin du chargement, isLoading mis à false');
      setIsLoading(false);
    }
  };

  // Fonction pour gérer le succès de création d'une clé API
  const handleApiKeyCreated = (newKey: ApiKey) => {
    console.log('📊 [DASHBOARD] Nouvelle clé API créée, rechargement des données...');
    // Recharger toutes les données du dashboard
    loadDashboardData();
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette clé API ?')) {
      return;
    }

    try {
      await apiService.deleteApiKey(keyId);
      setApiKeys(prevKeys => {
        const keysArray = Array.isArray(prevKeys) ? prevKeys : [];
        return keysArray.filter(key => key.id !== keyId);
      });
      showSuccess('Succès', 'Clé API supprimée avec succès !');
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      showError('Erreur', error.message || 'Impossible de supprimer la clé API');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copié !', 'Clé API copiée dans le presse-papiers');
    } catch (error) {
      showError('Erreur', 'Impossible de copier la clé API');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowApiKey(showApiKey === keyId ? null : keyId);
  };

  const getQuotaPercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  // S'assurer que apiKeys est toujours un tableau
  const safeApiKeys = Array.isArray(apiKeys) ? apiKeys : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-green-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Profil Utilisateur */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-400 p-3 rounded-full">
                <User className="h-6 w-6 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
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
              {isAdmin && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900 text-purple-400">
                  <Crown className="h-4 w-4 mr-1" />
                  Admin
                </span>
              )}
            </div>
          </div>
          
          {/* Informations supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-sm">
              <span className="text-gray-400">Membre depuis :</span>
              <p className="text-white">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'
                }
              </p>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Statut :</span>
              <p className="text-green-400 font-medium">
                {user?.is_premium ? 'Premium' : 'Gratuit'}
              </p>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Clés API :</span>
              <p className="text-white">{safeApiKeys.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        {/* Clés API */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Clés API</p>
              <p className="text-2xl font-bold text-white">{safeApiKeys.length}</p>
            </div>
            <Key className="h-8 w-8 text-green-400" />
          </div>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="w-full mt-4 bg-green-400 text-black px-4 py-2 rounded-md hover:bg-green-500 transition-colors font-semibold"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Nouvelle clé
          </button>
        </div>

        {/* Quota Quotidien */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Appels Aujourd'hui</p>
              <p className="text-2xl font-bold text-white">
                {quotaInfo?.daily_used || 0}
              </p>
              <p className="text-sm text-gray-400">
                / {quotaInfo?.daily_limit || 1000}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-400" />
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                getQuotaPercentage(quotaInfo?.daily_used || 0, quotaInfo?.daily_limit || 1000) >= 90
                  ? 'bg-red-400'
                  : getQuotaPercentage(quotaInfo?.daily_used || 0, quotaInfo?.daily_limit || 1000) >= 75
                  ? 'bg-yellow-400'
                  : 'bg-green-400'
              }`}
              style={{
                width: `${getQuotaPercentage(quotaInfo?.daily_used || 0, quotaInfo?.daily_limit || 1000)}%`
              }}
            />
          </div>
        </div>

        {/* Quota par Minute */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Appels/Minute</p>
              <p className="text-2xl font-bold text-white">
                {quotaInfo?.per_minute_used || 0}
              </p>
              <p className="text-sm text-gray-400">
                / {quotaInfo?.per_minute_limit || 60}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-400" />
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                getQuotaPercentage(quotaInfo?.per_minute_used || 0, quotaInfo?.per_minute_limit || 60) >= 90
                  ? 'bg-red-400'
                  : getQuotaPercentage(quotaInfo?.per_minute_used || 0, quotaInfo?.per_minute_limit || 60) >= 75
                  ? 'bg-yellow-400'
                  : 'bg-green-400'
              }`}
              style={{
                width: `${getQuotaPercentage(quotaInfo?.per_minute_used || 0, quotaInfo?.per_minute_limit || 60)}%`
              }}
            />
          </div>
        </div>

        {/* Plan */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Plan Actuel</p>
              <p className="text-2xl font-bold text-white capitalize">
                {quotaInfo?.type || 'free'}
              </p>
              {user?.is_premium && (
                <p className="text-sm text-green-400">Premium actif</p>
              )}
            </div>
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
          {!user?.is_premium && (
            <button
              onClick={() => router.push('/payment')}
              className="w-full mt-4 bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors font-semibold cursor-pointer"
            >
              Passer Premium
            </button>
          )}
        </div>
      </motion.div>

      {/* Section d'aide pour nouveaux utilisateurs */}
      {safeApiKeys.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Key className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-2">
                  Bienvenue sur Mister API !
                </h3>
                <p className="text-gray-300 mb-4">
                  Pour commencer à utiliser nos APIs, vous devez créer votre première clé API. 
                  Cette clé vous permettra d'accéder à toutes nos données (citations, animaux, pays, etc.).
                </p>
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-white mb-2">Comment ça marche :</h4>
                  <ol className="text-sm text-gray-300 space-y-1">
                    <li>1. Créez une clé API avec un nom descriptif</li>
                    <li>2. Utilisez cette clé dans vos requêtes HTTP</li>
                    <li>3. Consultez vos statistiques d'utilisation</li>
                    <li>4. Gérez vos quotas et limites</li>
                  </ol>
                </div>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="bg-green-400 text-black px-4 py-2 rounded-md hover:bg-green-500 transition-colors font-medium"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Créer ma première clé API
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      
      {/* Clés API */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 mb-8"
      >
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Mes Clés API</h2>
        </div>
        <div className="p-6">
          {safeApiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Aucune clé API
              </h3>
              <p className="text-gray-400 mb-4">
                Créez votre première clé API pour commencer à utiliser nos services.
              </p>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="bg-green-400 text-black px-4 py-2 rounded-md hover:bg-green-500 transition-colors font-semibold"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Créer une clé API
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {safeApiKeys.map((key) => (
                <div
                  key={key.id}
                  className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-white">{key.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.type === 'premium' 
                            ? 'bg-yellow-900 text-yellow-400' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {key.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Table: {key.table_name} • Créée le {new Date(key.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <span>Appels/jour: {key.appels_jour}</span>
                          <span>Appels/min: {key.appels_minute}</span>
                          <span className={key.is_active ? 'text-green-400' : 'text-red-400'}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {showApiKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.api_key)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {showApiKey === key.id && (
                    <div className="mt-3 p-3 bg-gray-800 rounded-md">
                      <code className="text-sm break-all text-green-400">{key.api_key}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* APIs Overview - Grille 3x3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {/* API Cards */}
        <ApiExplorerCard
          type="punchlines"
          data={randomCitation}
          index={0}
        />

        <ApiExplorerCard
          type="animals"
          data={randomAnimal}
          index={1}
        />

        <ApiExplorerCard
          type="pays"
          data={randomPays}
          index={2}
        />

        {/* Action Cards */}
        {/* Temporairement masqué - Statistiques d'Usage
        <ActionCard
          title="Statistiques d'Usage"
          description="Surveillez votre utilisation et vos quotas en temps réel."
          icon={<BarChart3 className="h-5 w-5" />}
          color="text-yellow-400"
          bgColor="bg-yellow-400"
          hoverColor="hover:bg-yellow-500"
          route="/stats"
          index={3}
        />
        */}

        <ActionCard
          title="Support"
          description="Besoin d'aide ? Contactez notre équipe support."
          icon={<AlertCircle className="h-5 w-5" />}
          color="text-red-400"
          bgColor="bg-red-400"
          hoverColor="hover:bg-red-500"
          route="/contact"
          index={4}
        />

        <ActionCard
          title="Paramètres"
          description="Gérez vos préférences et paramètres de compte."
          icon={<Settings className="h-5 w-5" />}
          color="text-gray-400"
          bgColor="bg-gray-400"
          hoverColor="hover:bg-gray-500"
          route="/settings"
          index={5}
        />
      </motion.div>

      {/* Actions Administrateur */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Actions Administrateur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors"
            >
              <Database className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-300">Gestion des Données</span>
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors"
            >
              <User className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-300">Gestion Utilisateurs</span>
            </button>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-300">Analytics</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal Nouvelle Clé API */}
      <CreateApiKeyModal
        isOpen={showNewKeyModal}
        onClose={() => setShowNewKeyModal(false)}
        onSuccess={handleApiKeyCreated}
        user={user}
      />
    </div>
  );
} 