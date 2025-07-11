'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Shield, BarChart3, Cookie } from 'lucide-react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieBannerProps {
  onAcceptAll: () => void;
  onAcceptSelected: (preferences: CookiePreferences) => void;
  onRejectAll: () => void;
}

export default function CookieBanner({ onAcceptAll, onAcceptSelected, onRejectAll }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    onAcceptAll();
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    onAcceptSelected(preferences);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const rejected: CookiePreferences = {
      necessary: true, // Toujours activé
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(rejected));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    onRejectAll();
    setIsVisible(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Ne peut pas être désactivé
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-green-400 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {!showSettings ? (
              // Vue principale de la bannière
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Cookie className="h-6 w-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Nous utilisons des cookies
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
                    En continuant à utiliser notre site, vous acceptez notre{' '}
                    <Link href="/politique-confidentialite" target="_blank" className="text-green-400 hover:text-green-300 underline">
                      politique de confidentialité
                    </Link>.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Personnaliser</span>
                  </button>
                  
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Refuser tout
                  </button>
                  
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-green-400 text-black rounded-lg hover:bg-green-300 transition-colors font-medium text-sm"
                  >
                    Accepter tout
                  </button>
                </div>
              </div>
            ) : (
              // Vue des paramètres détaillés
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-6 w-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Paramètres des cookies
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Cookies nécessaires */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-5 w-5 text-green-400" />
                        <h4 className="font-medium text-white">Cookies nécessaires</h4>
                        <span className="px-2 py-1 bg-green-900 text-green-400 text-xs rounded-full">
                          Toujours actif
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Ces cookies sont essentiels au fonctionnement du site. Ils incluent les cookies de session, 
                        d'authentification et de sécurité. Ils ne peuvent pas être désactivés.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="h-4 w-4 text-green-400 focus:ring-green-400 border-gray-600 rounded bg-gray-700 mt-1"
                    />
                  </div>

                  {/* Cookies analytiques */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-blue-400" />
                        <h4 className="font-medium text-white">Cookies analytiques</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site 
                        en collectant des informations de manière anonyme (Google Analytics).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                      className="h-4 w-4 text-blue-400 focus:ring-blue-400 border-gray-600 rounded bg-gray-700 mt-1"
                    />
                  </div>

                  {/* Cookies de marketing */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Cookie className="h-5 w-5 text-purple-400" />
                        <h4 className="font-medium text-white">Cookies de marketing</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Ces cookies sont utilisés pour suivre les visiteurs sur différents sites web afin 
                        d'afficher des publicités pertinentes et personnalisées.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                      className="h-4 w-4 text-purple-400 focus:ring-purple-400 border-gray-600 rounded bg-gray-700 mt-1"
                    />
                  </div>

                  {/* Cookies de préférences */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Settings className="h-5 w-5 text-yellow-400" />
                        <h4 className="font-medium text-white">Cookies de préférences</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Ces cookies permettent au site de mémoriser vos choix (langue, région, etc.) 
                        et d'offrir des fonctionnalités améliorées et plus personnalisées.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={() => handlePreferenceChange('preferences')}
                      className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-600 rounded bg-gray-700 mt-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Refuser tout
                  </button>
                  
                  <button
                    onClick={handleAcceptSelected}
                    className="px-4 py-2 bg-green-400 text-black rounded-lg hover:bg-green-300 transition-colors font-medium text-sm"
                  >
                    Enregistrer mes choix
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 