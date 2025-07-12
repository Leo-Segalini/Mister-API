import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration des routes protégées
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/api-keys',
  '/billing'
];

// Configuration des routes admin
const adminRoutes = [
  '/admin'
];

// Configuration des routes publiques
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/register/success',
  '/pricing',
  '/docs',
  '/apis',
  '/contact',
  '/mentions-legales',
  '/politique-confidentialite'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Gestion des routes API avec headers CORS
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Refresh-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
  
  // Vérification simplifiée de l'authentification
  const hasAccessToken = request.cookies.get('access_token') || request.cookies.get('sb-access-token');
  const isAuthenticated = !!hasAccessToken;
  
  // Vérification des routes protégées
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  // Redirection si route protégée sans authentification
  if (isProtectedRoute && !isAuthenticated) {
    console.log(`🚫 Middleware: Accès refusé à ${pathname} - Redirection vers login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirection si authentifié et sur page de connexion
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    console.log(`✅ Middleware: Utilisateur connecté sur ${pathname} - Redirection vers dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Ajouter des headers de sécurité
  const response = NextResponse.next();
  
  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Configuration des routes à traiter par le middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 