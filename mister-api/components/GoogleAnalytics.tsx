'use client'

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'

export default function GoogleAnalytics() {
  // Utilise le hook pour gérer Google Analytics
  useGoogleAnalytics()
  
  // Ce composant ne rend rien visuellement
  return null
} 