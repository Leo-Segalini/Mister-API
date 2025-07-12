// Google Analytics utility functions
export const GA_TRACKING_ID = 'G-NHVKMZLNRY'

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Initialize Google Analytics (maintenant géré dans le head)
export const initGA = () => {
  // Le script est maintenant chargé dans le head du document
  // Cette fonction est conservée pour la compatibilité
  console.log('Google Analytics already loaded in head')
}

// Remove Google Analytics (maintenant géré via consent)
export const removeGA = () => {
  // Le script reste chargé mais le tracking est désactivé via consent
  // Cette fonction est conservée pour la compatibilité
  console.log('Google Analytics tracking disabled via consent')
}

// Declare global types
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
} 