import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Middleware s'exécute seulement si l'utilisateur est authentifié
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Autoriser les routes publiques
        if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
          return true;
        }

        // Autoriser les routes API d'authentification
        if (pathname.startsWith('/api/auth')) {
          return true;
        }

        // Pour toutes les autres routes (dashboard, api), vérifier le token
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Configuration des routes à protéger
export const config = {
  matcher: [
    // Protéger toutes les routes dashboard
    '/dashboard/:path*',
    // Protéger toutes les routes API sauf auth
    '/api/:path((?!auth).*)',
  ],
};
