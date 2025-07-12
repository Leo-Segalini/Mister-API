'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCookies } from './useCookies'
import { pageview } from '@/lib/gtag'

export const useGoogleAnalytics = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isCookieAllowed } = useCookies()

  useEffect(() => {
    // Gérer le consentement Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      if (isCookieAllowed('analytics')) {
        // Activer le tracking
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted',
          'ad_storage': 'granted'
        });
      } else {
        // Désactiver le tracking
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied'
        });
      }
    }
  }, [isCookieAllowed])

  useEffect(() => {
    // Track page views when analytics cookies are accepted
    if (isCookieAllowed('analytics') && typeof window !== 'undefined' && (window as any).gtag) {
      const url = pathname + searchParams.toString()
      pageview(url)
    }
  }, [pathname, searchParams, isCookieAllowed])
} 