'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCookies } from './useCookies'
import { pageview, initGA, removeGA } from '@/lib/gtag'

export const useGoogleAnalytics = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isCookieAllowed } = useCookies()

  useEffect(() => {
    // Check if analytics cookies are accepted
    if (isCookieAllowed('analytics')) {
      // Initialize Google Analytics if not already done
      if (typeof window !== 'undefined' && !(window as any).gtag) {
        initGA()
      }
    } else {
      // Remove Google Analytics if cookies are not accepted
      removeGA()
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