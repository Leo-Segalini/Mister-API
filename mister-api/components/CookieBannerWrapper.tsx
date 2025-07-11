'use client';

import React from 'react';
import CookieBanner from './CookieBanner';
import { useCookieContext } from './CookieProvider';
import type { CookiePreferences } from '@/hooks/useCookies';

export default function CookieBannerWrapper() {
  const { saveConsent } = useCookieContext();

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    saveConsent(allAccepted);
  };

  const handleAcceptSelected = (preferences: CookiePreferences) => {
    saveConsent(preferences);
  };

  const handleRejectAll = () => {
    const rejected: CookiePreferences = {
      necessary: true, // Toujours activé
      analytics: false,
      marketing: false,
      preferences: false
    };
    saveConsent(rejected);
  };

  return (
    <CookieBanner
      onAcceptAll={handleAcceptAll}
      onAcceptSelected={handleAcceptSelected}
      onRejectAll={handleRejectAll}
    />
  );
} 