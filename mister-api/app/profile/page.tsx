'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  Shield, 
  CreditCard,
  Bell,
  Key,
  Crown,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToastContext } from '@/components/ToastProvider';
import { apiService } from '@/lib/api';

interface ProfileFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_naissance: string;
  adresse_postale: string;
  code_postal: string;
  ville: string;
  pays: string;
}

interface SecurityFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  
  // États pour les formulaires
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    date_naissance: user?.date_naissance || '',
    adresse_postale: user?.adresse_postale || '',
    code_postal: user?.code_postal || '',
    ville: user?.ville || '',
    pays: user?.pays || ''
  });

  const [securityForm, setSecurityForm] = useState<SecurityFormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // États pour l'interface
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Mettre à jour le formulaire quand l'utilisateur change
  React.useEffect(() => {
    if (user) {
      setProfileForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        date_naissance: user.date_naissance || '',
        adresse_postale: user.adresse_postale || '',
        code_postal: user.code_postal || '',
        ville: user.ville || '',
        pays: user.pays || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);

    try {
      await apiService.updateProfile(profileForm);
      
      showSuccess('Succès', 'Profil mis à jour avec succès !');
      setIsEditingProfile(false);
    } catch (error: any) {
      showError('Erreur', error.message || 'Impossible de mettre à jour le profil');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityForm.new_password !== securityForm.confirm_password) {
      showError('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (securityForm.new_password.length < 8) {
      showError('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoadingPassword(true);

    try {
      await apiService.changePassword(securityForm.current_password, securityForm.new_password);
      
      showSuccess('Succès', 'Mot de passe modifié avec succès !');
      setIsChangingPassword(false);
      setSecurityForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      showError('Erreur', error.message || 'Impossible de modifier le mot de passe');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const cancelProfileEdit = () => {
    setProfileForm({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      date_naissance: user?.date_naissance || '',
      adresse_postale: user?.adresse_postale || '',
      code_postal: user?.code_postal || '',
      ville: user?.ville || '',
      pays: user?.pays || ''
    });
    setIsEditingProfile(false);
  };

  const cancelPasswordChange = () => {
    setSecurityForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setIsChangingPassword(false);
  };

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
        <header className="bg-gray-900 shadow-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <User className="h-8 w-8 text-green-400" />
                <h1 className="text-xl font-bold text-white">Profil & Paramètres</h1>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Retour au Dashboard
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Informations Premium */}
          {user?.is_premium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-600/30 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-yellow-400">Statut Premium</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Expire le :</p>
                    <p className="text-white font-medium">
                      {user.premium_expires_at 
                        ? new Date(user.premium_expires_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">ID Client Stripe :</p>
                    <p className="text-white font-medium font-mono text-sm">
                      {user.stripe_customer_id || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profil Utilisateur */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900 rounded-lg shadow-sm border border-gray-800"
            >
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-green-400" />
                    <h2 className="text-lg font-semibold text-white">Informations Personnelles</h2>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={profileForm.prenom}
                          onChange={(e) => setProfileForm({...profileForm, prenom: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={profileForm.nom}
                          onChange={(e) => setProfileForm({...profileForm, nom: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-400 cursor-not-allowed"
                        />
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Téléphone
                      </label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <input
                          type="tel"
                          value={profileForm.telephone}
                          onChange={(e) => setProfileForm({...profileForm, telephone: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        value={profileForm.date_naissance}
                        onChange={(e) => setProfileForm({...profileForm, date_naissance: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Adresse postale
                      </label>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          value={profileForm.adresse_postale}
                          onChange={(e) => setProfileForm({...profileForm, adresse_postale: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Code postal
                        </label>
                        <input
                          type="text"
                          value={profileForm.code_postal}
                          onChange={(e) => setProfileForm({...profileForm, code_postal: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Ville
                        </label>
                        <input
                          type="text"
                          value={profileForm.ville}
                          onChange={(e) => setProfileForm({...profileForm, ville: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Pays
                        </label>
                        <input
                          type="text"
                          value={profileForm.pays}
                          onChange={(e) => setProfileForm({...profileForm, pays: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isLoadingProfile}
                        className="flex items-center space-x-2 bg-green-400 text-black px-4 py-2 rounded-md hover:bg-green-500 transition-colors font-semibold disabled:opacity-50"
                      >
                        {isLoadingProfile ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{isLoadingProfile ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelProfileEdit}
                        className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Prénom</p>
                        <p className="text-white font-medium">{user?.prenom || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Nom</p>
                        <p className="text-white font-medium">{user?.nom || 'Non renseigné'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">{user?.email}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Téléphone</p>
                      <p className="text-white font-medium">{user?.telephone || 'Non renseigné'}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Date de naissance</p>
                      <p className="text-white font-medium">
                        {user?.date_naissance 
                          ? new Date(user.date_naissance).toLocaleDateString('fr-FR')
                          : 'Non renseignée'
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Adresse</p>
                      <p className="text-white font-medium">
                        {user?.adresse_postale ? (
                          <>
                            {user.adresse_postale}<br />
                            {user.code_postal} {user.ville}<br />
                            {user.pays}
                          </>
                        ) : (
                          'Non renseignée'
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Sécurité */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Changement de mot de passe */}
              <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800">
                <div className="px-6 py-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-white">Sécurité</h2>
                    </div>
                    {!isChangingPassword && (
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Key className="h-4 w-4" />
                        <span>Changer le mot de passe</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {isChangingPassword ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={securityForm.current_password}
                            onChange={(e) => setSecurityForm({...securityForm, current_password: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={securityForm.new_password}
                            onChange={(e) => setSecurityForm({...securityForm, new_password: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Confirmer le nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={securityForm.confirm_password}
                            onChange={(e) => setSecurityForm({...securityForm, confirm_password: e.target.value})}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          disabled={isLoadingPassword}
                          className="flex items-center space-x-2 bg-blue-400 text-black px-4 py-2 rounded-md hover:bg-blue-500 transition-colors font-semibold disabled:opacity-50"
                        >
                          {isLoadingPassword ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>{isLoadingPassword ? 'Modification...' : 'Modifier'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelPasswordChange}
                          className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Annuler</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Authentification sécurisée</p>
                          <p className="text-gray-400 text-sm">Votre compte est protégé par un mot de passe</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Membre depuis</p>
                          <p className="text-gray-400 text-sm">
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
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Paramètres de notification */}
              <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800">
                <div className="px-6 py-4 border-b border-gray-800">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Notifications</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Emails de sécurité</p>
                        <p className="text-gray-400 text-sm">Recevoir des notifications de connexion</p>
                      </div>
                      <button className="bg-green-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                        Activé
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Newsletter</p>
                        <p className="text-gray-400 text-sm">Recevoir les dernières nouvelles</p>
                      </div>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-500 transition-colors">
                        Désactivé
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gestion du compte */}
              <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800">
                <div className="px-6 py-4 border-b border-gray-800">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-orange-400" />
                    <h2 className="text-lg font-semibold text-white">Gestion du compte</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {user?.is_premium && (
                      <button
                        onClick={() => router.push('/payment')}
                        className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Gérer mon abonnement Premium</span>
                      </button>
                    )}

                    <button
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Key className="h-4 w-4" />
                      <span>Gérer mes clés API</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                          // Logique de suppression de compte
                        }
                      }}
                      className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Supprimer mon compte</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 