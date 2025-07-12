'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsent {
  preferences: CookiePreferences;
  date: string;
}

export function useCookies() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les préférences depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('cookie-consent');
      const savedDate = localStorage.getItem('cookie-consent-date');
      
      if (savedConsent && savedDate) {
        try {
          const preferences = JSON.parse(savedConsent);
          setConsent({
            preferences,
            date: savedDate
          });
        } catch (error) {
          console.error('Erreur lors du chargement des préférences cookies:', error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarder les préférences
  const saveConsent = useCallback((preferences: CookiePreferences) => {
    const consentData: CookieConsent = {
      preferences,
      date: new Date().toISOString()
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', consentData.date);
    setConsent(consentData);
    
    // Appliquer les préférences
    applyCookiePreferences(preferences);
  }, []);

  // Appliquer les préférences de cookies
  const applyCookiePreferences = useCallback((preferences: CookiePreferences) => {
    if (typeof window === 'undefined') return;

    // Cookies nécessaires - toujours activés
    if (preferences.necessary) {
      // Activer les cookies de session, authentification, etc.
      // console.log('🍪 Cookies nécessaires activés');
    }

    // Cookies analytiques
    if (preferences.analytics) {
      // Activer Google Analytics
      enableGoogleAnalytics();
      // console.log('📊 Cookies analytiques activés');
    } else {
      // Désactiver Google Analytics
      disableGoogleAnalytics();
      // console.log('📊 Cookies analytiques désactivés');
    }

    // Cookies de marketing
    if (preferences.marketing) {
      // Activer les cookies de marketing
      enableMarketingCookies();
      // console.log('🎯 Cookies de marketing activés');
    } else {
      // Désactiver les cookies de marketing
      disableMarketingCookies();
      // console.log('🎯 Cookies de marketing désactivés');
    }

    // Cookies de préférences
    if (preferences.preferences) {
      // Activer les cookies de préférences
      enablePreferenceCookies();
      // console.log('⚙️ Cookies de préférences activés');
    } else {
      // Désactiver les cookies de préférences
      disablePreferenceCookies();
      // console.log('⚙️ Cookies de préférences désactivés');
    }
  }, []);

  // Réinitialiser les préférences
  const resetConsent = useCallback(() => {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
    setConsent(null);
    
    // Désactiver tous les cookies non nécessaires
    disableGoogleAnalytics();
    disableMarketingCookies();
    disablePreferenceCookies();
    
    // console.log('🔄 Préférences cookies réinitialisées');
  }, []);

  // Vérifier si l'utilisateur a donné son consentement
  const hasConsent = useCallback(() => {
    return consent !== null;
  }, [consent]);

  // Vérifier si un type de cookie spécifique est autorisé
  const isCookieAllowed = useCallback((type: keyof CookiePreferences) => {
    if (!consent) return false;
    return consent.preferences[type];
  }, [consent]);

  // Obtenir la date du consentement
  const getConsentDate = useCallback(() => {
    return consent?.date ? new Date(consent.date) : null;
  }, [consent]);

  return {
    consent,
    isLoaded,
    saveConsent,
    resetConsent,
    hasConsent,
    isCookieAllowed,
    getConsentDate,
    applyCookiePreferences
  };
}

// Fonctions pour gérer Google Analytics
function enableGoogleAnalytics() {
  if (typeof window === 'undefined') return;
  
  // Activer Google Analytics via consent
  if ((window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted'
    });
  }
  // console.log('📊 Google Analytics activé');
}

function disableGoogleAnalytics() {
  if (typeof window === 'undefined') return;
  
  // Désactiver Google Analytics via consent
  if ((window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied'
    });
  }
  // console.log('📊 Google Analytics désactivé');
}

// Fonctions pour gérer les cookies de marketing
function enableMarketingCookies() {
  if (typeof window === 'undefined') return;
  
  // Activer les cookies de marketing
  // Exemple: Facebook Pixel, Google Ads, etc.
  
  // console.log('🎯 Cookies de marketing activés');
}

function disableMarketingCookies() {
  if (typeof window === 'undefined') return;
  
  // Désactiver les cookies de marketing
  
  // console.log('🎯 Cookies de marketing désactivés');
}

// Fonctions pour gérer les cookies de préférences
function enablePreferenceCookies() {
  if (typeof window === 'undefined') return;
  
  // Activer les cookies de préférences
  // Exemple: langue, thème, etc.
  
  // console.log('⚙️ Cookies de préférences activés');
}

function disablePreferenceCookies() {
  if (typeof window === 'undefined') return;
  
  // Désactiver les cookies de préférences
  
  // console.log('⚙️ Cookies de préférences désactivés');
} 