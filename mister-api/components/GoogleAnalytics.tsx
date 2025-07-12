'use client'

import { Suspense } from 'react'
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'

function GoogleAnalyticsContent() {
  // Utilise le hook pour gérer Google Analytics
  useGoogleAnalytics()
  
  // Ce composant ne rend rien visuellement
  return null
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsContent />
    </Suspense>
  )
} 