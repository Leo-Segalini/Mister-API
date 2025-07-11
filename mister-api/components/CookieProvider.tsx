'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCookies, CookiePreferences } from '@/hooks/useCookies';

interface CookieContextType {
  consent: any;
  isLoaded: boolean;
  saveConsent: (preferences: CookiePreferences) => void;
  resetConsent: () => void;
  hasConsent: () => boolean;
  isCookieAllowed: (type: keyof CookiePreferences) => boolean;
  getConsentDate: () => Date | null;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: ReactNode }) {
  const cookieUtils = useCookies();

  return (
    <CookieContext.Provider value={cookieUtils}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieContext() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieContext must be used within a CookieProvider');
  }
  return context;
} 