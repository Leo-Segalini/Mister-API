import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBannerWrapper from "@/components/CookieBannerWrapper";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ToastProvider";
import { CookieProvider } from "@/components/CookieProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mister API - Collection d'APIs pour Développeurs",
  description: "Collection d'APIs pour développeurs - Citations historiques, Animaux, Pays du monde",
  keywords: "API, développeur, citations historiques, animaux, pays, REST, JSON, NestJS, Supabase",
  authors: [{ name: "Mister API Team" }],
  creator: "Mister API",
  publisher: "Mister API",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Mister API - Collection d'APIs pour Développeurs",
    description: "Collection d'APIs pour développeurs - Citations historiques, Animaux, Pays du monde",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: "Mister API",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mister API - Collection d'APIs pour Développeurs",
    description: "Collection d'APIs pour développeurs - Citations historiques, Animaux, Pays du monde",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Google Analytics - Chargé mais désactivé par défaut */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NHVKMZLNRY"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Désactiver le tracking par défaut jusqu'au consentement
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied'
              });
              
              gtag('config', 'G-NHVKMZLNRY', {
                'anonymize_ip': true
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <AuthProvider>
          <ToastProvider>
            <CookieProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pt-16">
                {children}
              </main>
              <Footer />
                <CookieBannerWrapper />
                <GoogleAnalytics />
            </div>
            </CookieProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
