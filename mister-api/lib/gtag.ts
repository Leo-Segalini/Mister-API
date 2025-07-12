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

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined') {
    // Load the Google Analytics script
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
    document.head.appendChild(script1)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', GA_TRACKING_ID, {
      page_location: window.location.href,
    })
  }
}

// Remove Google Analytics
export const removeGA = () => {
  if (typeof window !== 'undefined') {
    // Remove gtag script
    const gtagScript = document.querySelector('script[src*="googletagmanager.com"]')
    if (gtagScript) {
      gtagScript.remove()
    }

    // Clear dataLayer
    if (window.dataLayer) {
      window.dataLayer = []
    }

    // Remove gtag function
    (window as any).gtag = undefined
  }
}

// Declare global types
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
} 