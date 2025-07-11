'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  X, 
  Tag, 
  Crown, 
  User, 
  ChevronDown, 
  Info, 
  Plus 
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToastContext } from '@/components/ToastProvider';
import type { ApiKey } from '@/types';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newKey: ApiKey) => void;
  user: any;
}

export default function CreateApiKeyModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  user 
}: CreateApiKeyModalProps) {
  const { showSuccess, showError } = useToastContext();
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyTable, setNewKeyTable] = useState('punchlines');

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      showError('Erreur', 'Veuillez saisir un nom pour la clé API');
      return;
    }

    try {
      setIsCreatingKey(true);
      
      // Récupérer automatiquement le type basé sur le statut de l'utilisateur
      const keyType = user?.is_premium ? 'premium' : 'free';
      
      const newKey = await apiService.createApiKey({
        name: newKeyName,
        table_name: newKeyTable,
        type: keyType // Utilise automatiquement le statut de l'utilisateur
      });
      
      // Réinitialiser le formulaire
      setNewKeyName('');
      setNewKeyTable('punchlines');
      
      // Fermer la modal
      onClose();
      
      // Notifier le parent du succès
      onSuccess(newKey);
      
      showSuccess('Succès', 'Clé API créée avec succès !');
    } catch (error: any) {
      console.error('Error creating API key:', error);
      showError('Erreur', error.message || 'Impossible de créer la clé API');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleClose = () => {
    if (!isCreatingKey) {
      setNewKeyName('');
      setNewKeyTable('punchlines');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 w-full max-w-lg border border-gray-700/50 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-400/20 p-3 rounded-xl">
              <Key className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Nouvelle Clé API
              </h3>
              <p className="text-sm text-gray-400">
                Créez une clé pour accéder à nos APIs
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isCreatingKey}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire */}
        <div className="space-y-6">
          {/* Nom de la clé */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la clé
            </label>
            <div className="relative">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={isCreatingKey}
                className="w-full px-4 py-3 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 bg-gray-800/50 text-white placeholder-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Ex: Mon application mobile"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Statut automatique */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${user?.is_premium ? 'bg-yellow-400/20' : 'bg-blue-400/20'}`}>
                  {user?.is_premium ? (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <User className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Type de clé</p>
                  <p className="text-xs text-gray-400">
                    Basé sur votre statut actuel
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user?.is_premium 
                  ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' 
                  : 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
              }`}>
                {user?.is_premium ? 'Premium' : 'Gratuit'}
              </span>
            </div>
          </div>

          {/* API cible */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API cible
            </label>
            <div className="relative">
              <select
                value={newKeyTable}
                onChange={(e) => setNewKeyTable(e.target.value)}
                disabled={isCreatingKey}
                className="w-full px-4 py-3 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 bg-gray-800/50 text-white appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="punchlines">📚 Citations Historiques</option>
                <option value="animaux">🐾 Animaux</option>
                <option value="pays_du_monde">🌍 Pays du Monde</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Informations sur les quotas */}
          <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">Quotas automatiques</p>
                <p className="text-gray-300">
                  {user?.is_premium 
                    ? 'Clé Premium : 150,000 appels/jour, 100 appels/minute'
                    : 'Clé Gratuite : 500 appels/jour, 5 appels/minute'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={handleClose}
            disabled={isCreatingKey}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-700/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={createApiKey}
            disabled={isCreatingKey || !newKeyName.trim()}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-black rounded-xl hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 flex items-center space-x-2"
          >
            {isCreatingKey ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                <span>Création...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Créer la clé</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
} 