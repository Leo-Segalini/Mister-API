import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration des routes protégées
const protectedRoutes = [
  '/dashboard',
  '/admin',
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
  '/pricing',
  '/docs',
  '/apis',
  '/contact'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // TEMPORAIREMENT DÉSACTIVÉ - Laisser la logique côté client gérer l'authentification
  // pour éviter les conflits et les boucles infinies
  
  console.log(`🔍 Middleware - Route: ${pathname} (middleware temporairement désactivé)`);

  // Ajouter des headers de sécurité seulement
  const response = NextResponse.next();
  
  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Headers CORS pour les API
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

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