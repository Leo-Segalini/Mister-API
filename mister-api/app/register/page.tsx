'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check, Calendar, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import type { RegisterData } from '@/types';

// Fonction utilitaire pour nettoyer les cookies et le stockage
const clearAllSessionData = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 [REGISTER] Nettoyage complet des données de session');
  
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
      'sb-refresh-token',
      'supabase.auth.token',
      'auth-token',
      'session-token'
    ];
    
    authCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });
    
    console.log('✅ [REGISTER] Nettoyage terminé avec succès');
  } catch (error) {
    console.error('❌ [REGISTER] Erreur lors du nettoyage:', error);
  }
};

export default function Register() {
  const router = useRouter();
  const { signup } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    adresse_postale: '',
    code_postal: '',
    ville: '',
    pays: '',
    telephone: '',
    politique_confidentialite_acceptee: false,
    conditions_generales_acceptees: false
  });

  // Nettoyer les cookies au chargement de la page d'inscription
  useEffect(() => {
    console.log('🧹 [REGISTER] Nettoyage des cookies au chargement de la page');
    clearAllSessionData();
  }, []);

  // Fonction de validation du mot de passe
  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    setPasswordValidation(validations);
    return Object.values(validations).every(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.email || !formData.password || !formData.nom || !formData.prenom) {
      showError('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Validation des conditions et politiques
    if (!formData.politique_confidentialite_acceptee) {
      showError('Erreur', 'Vous devez accepter la politique de confidentialité pour continuer');
      return;
    }
    
    if (!formData.conditions_generales_acceptees) {
      showError('Erreur', 'Vous devez accepter les conditions générales pour continuer');
      return;
    }
    
    // Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      showError('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    // Validation robuste du mot de passe
    if (!validatePassword(formData.password)) {
      showError('Erreur', 'Le mot de passe ne respecte pas les critères de sécurité');
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
      // Préparer les données pour l'API (sans confirmPassword)
      const registerData: RegisterData = {
        email: formData.email,
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        date_naissance: formData.date_naissance || undefined,
        adresse_postale: formData.adresse_postale || undefined,
        code_postal: formData.code_postal || undefined,
        ville: formData.ville || undefined,
        pays: formData.pays || undefined,
        telephone: formData.telephone || undefined,
        politique_confidentialite_acceptee: formData.politique_confidentialite_acceptee,
        conditions_generales_acceptees: formData.conditions_generales_acceptees
      };

      console.log('🚀 Starting registration process...');
      await signup(registerData);
      
      console.log('✅ Registration successful, redirecting to success page');
      
      // Rediriger vers la page de succès avec l'email en paramètre
      router.push(`/register/success?email=${encodeURIComponent(formData.email)}`);

    } catch (error: any) {
      console.error('❌ Register error:', error);
      
      // Gestion spécifique des erreurs
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (error.message) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          errorMessage = 'Un compte avec cette adresse email existe déjà';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Adresse email invalide';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité';
        } else if (error.message.includes('Rate limit exceeded')) {
          errorMessage = 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showError('Erreur d\'inscription', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <h2 className="text-4xl font-bold text-green-400">
              Créer un compte
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              Rejoignez Mister API et accédez à nos APIs de citations, animaux et pays du monde
            </p>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-8 space-y-6 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700"
          onSubmit={handleSubmit}
        >
          {/* Informations personnelles */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

            <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    id="nom"
                    name="nom"
                  type="text"
                  required
                  disabled={isLoading}
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                    placeholder="Votre nom"
                />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isLoading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-300 mb-2">
                Date de naissance
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="date_naissance"
                  name="date_naissance"
                  type="date"
                  disabled={isLoading}
                  value={formData.date_naissance}
                  onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              Adresse (optionnel)
            </h3>
            
            <div>
              <label htmlFor="adresse_postale" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse postale
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="adresse_postale"
                  name="adresse_postale"
                  type="text"
                  disabled={isLoading}
                  value={formData.adresse_postale}
                  onChange={(e) => setFormData({ ...formData, adresse_postale: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                  placeholder="123 Rue de la Paix"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="code_postal" className="block text-sm font-medium text-gray-300 mb-2">
                  Code postal
                </label>
                <input
                  id="code_postal"
                  name="code_postal"
                  type="text"
                  disabled={isLoading}
                  value={formData.code_postal}
                  onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                  className="w-full px-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                  placeholder="75001"
                />
              </div>

              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-gray-300 mb-2">
                  Ville
                </label>
                <input
                  id="ville"
                  name="ville"
                  type="text"
                  disabled={isLoading}
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="w-full px-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label htmlFor="pays" className="block text-sm font-medium text-gray-300 mb-2">
                  Pays
                </label>
                <input
                  id="pays"
                  name="pays"
                  type="text"
                  disabled={isLoading}
                  value={formData.pays}
                  onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                  className="w-full px-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                  placeholder="France"
                />
              </div>
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  disabled={isLoading}
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              Sécurité
            </h3>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    validatePassword(e.target.value);
                  }}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Critères de sécurité :</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <Check className={`h-3 w-3 mr-2 ${passwordValidation.length ? 'text-green-400' : 'text-gray-500'}`} />
                      <span className={passwordValidation.length ? 'text-green-400' : 'text-gray-500'}>
                        Au moins 8 caractères
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Check className={`h-3 w-3 mr-2 ${passwordValidation.uppercase ? 'text-green-400' : 'text-gray-500'}`} />
                      <span className={passwordValidation.uppercase ? 'text-green-400' : 'text-gray-500'}>
                        Au moins 1 majuscule (A-Z)
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Check className={`h-3 w-3 mr-2 ${passwordValidation.lowercase ? 'text-green-400' : 'text-gray-500'}`} />
                      <span className={passwordValidation.lowercase ? 'text-green-400' : 'text-gray-500'}>
                        Au moins 1 minuscule (a-z)
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Check className={`h-3 w-3 mr-2 ${passwordValidation.number ? 'text-green-400' : 'text-gray-500'}`} />
                      <span className={passwordValidation.number ? 'text-green-400' : 'text-gray-500'}>
                        Au moins 1 chiffre (0-9)
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Check className={`h-3 w-3 mr-2 ${passwordValidation.special ? 'text-green-400' : 'text-gray-500'}`} />
                      <span className={passwordValidation.special ? 'text-green-400' : 'text-gray-500'}>
                        Au moins 1 caractère spécial (!@#$%^&*...)
                      </span>
                    </div>
                  </div>
                  
                  {/* Barre de force du mot de passe */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Force du mot de passe :</span>
                      <span className={
                        Object.values(passwordValidation).every(Boolean) ? 'text-green-400' :
                        Object.values(passwordValidation).filter(Boolean).length >= 3 ? 'text-yellow-400' :
                        'text-red-400'
                      }>
                        {Object.values(passwordValidation).every(Boolean) ? 'Fort' :
                         Object.values(passwordValidation).filter(Boolean).length >= 3 ? 'Moyen' :
                         'Faible'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          Object.values(passwordValidation).every(Boolean) ? 'bg-green-400' :
                          Object.values(passwordValidation).filter(Boolean).length >= 3 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{
                          width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Conditions et politiques obligatoires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
              Conditions obligatoires
            </h3>
            
            {/* Politique de confidentialité */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  id="politique_confidentialite"
                  name="politique_confidentialite"
                  type="checkbox"
                  required
                  disabled={isLoading}
                  checked={formData.politique_confidentialite_acceptee}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    politique_confidentialite_acceptee: e.target.checked 
                  })}
                  className="h-4 w-4 text-green-400 focus:ring-green-400 border-gray-600 rounded bg-gray-900/50 mt-1 disabled:opacity-50"
                />
                <label htmlFor="politique_confidentialite" className="ml-2 block text-sm text-gray-300">
                  <span className="font-medium">J'accepte la politique de confidentialité *</span>
                  <p className="text-xs text-gray-400 mt-1">
                    Nous collectons et traitons vos données personnelles conformément au RGPD. 
                    Vos données ne seront jamais vendues à des tiers.
                  </p>
                </label>
              </div>
              
              {/* Aperçu de la politique de confidentialité */}
              <details className="ml-6 bg-gray-900/30 rounded-lg p-3 border border-gray-700">
                <summary className="text-xs text-green-400 cursor-pointer hover:text-green-300">
                  📄 Voir les détails de la politique de confidentialité
                </summary>
                <div className="mt-2 text-xs text-gray-400 space-y-2">
                  <p><strong>Collecte des données :</strong> Email, nom, prénom, adresse postale</p>
                  <p><strong>Utilisation :</strong> Création de compte, accès aux APIs, support client</p>
                  <p><strong>Conservation :</strong> Jusqu'à suppression du compte</p>
                  <p><strong>Vos droits :</strong> Accès, rectification, suppression, portabilité</p>
                  <p><strong>Contact :</strong> privacy@mister-api.com</p>
                </div>
              </details>
            </div>

            {/* Conditions générales */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  id="conditions_generales"
                  name="conditions_generales"
                  type="checkbox"
                  required
                  disabled={isLoading}
                  checked={formData.conditions_generales_acceptees}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    conditions_generales_acceptees: e.target.checked 
                  })}
                  className="h-4 w-4 text-green-400 focus:ring-green-400 border-gray-600 rounded bg-gray-900/50 mt-1 disabled:opacity-50"
                />
                <label htmlFor="conditions_generales" className="ml-2 block text-sm text-gray-300">
                  <span className="font-medium">J'accepte les conditions générales d'utilisation *</span>
                  <p className="text-xs text-gray-400 mt-1">
                    Vous acceptez d'utiliser nos APIs conformément à nos conditions de service.
                  </p>
                </label>
              </div>
              
              {/* Aperçu des conditions générales */}
              <details className="ml-6 bg-gray-900/30 rounded-lg p-3 border border-gray-700">
                <summary className="text-xs text-green-400 cursor-pointer hover:text-green-300">
                  📋 Voir les conditions générales d'utilisation
                </summary>
                <div className="mt-2 text-xs text-gray-400 space-y-2">
                  <p><strong>Utilisation autorisée :</strong> Développement d'applications, projets personnels et commerciaux</p>
                  <p><strong>Limitations :</strong> Respect des quotas, pas d'utilisation abusive</p>
                  <p><strong>Responsabilité :</strong> Utilisation à vos propres risques</p>
                  <p><strong>Modifications :</strong> Nous pouvons modifier les conditions avec préavis</p>
                  <p><strong>Résiliation :</strong> Possibilité de suspendre l'accès en cas de non-respect</p>
                </div>
              </details>
            </div>

            {/* Newsletter (optionnel) */}
            <div className="flex items-start pt-2 border-t border-gray-700">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                disabled={isLoading}
                className="h-4 w-4 text-green-400 focus:ring-green-400 border-gray-600 rounded bg-gray-900/50 mt-1 disabled:opacity-50"
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-300">
                Je souhaite recevoir les actualités et les nouvelles APIs (optionnel)
              </label>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-black bg-green-400 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>Création en cours...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5" />
                <span>Créer mon compte</span>
              </div>
            )}
          </motion.button>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-green-400 hover:text-green-300 font-medium underline">
                Se connecter
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
} 