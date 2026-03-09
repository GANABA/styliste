import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Bloquer les comptes suspendus
    if (token?.suspended) {
      return NextResponse.redirect(new URL('/login?error=AccountSuspended', req.url));
    }

    // Protéger les routes admin : seuls les ADMIN peuvent y accéder
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (token?.role !== 'ADMIN') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Rediriger les ADMIN vers /admin/dashboard s'ils accèdent à /dashboard
    if (token?.role === 'ADMIN' && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

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

        // Pour toutes les autres routes (dashboard, api, admin), vérifier le token
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
    // Protéger toutes les routes admin
    '/admin/:path*',
    // Protéger toutes les routes API sauf auth
    '/api/:path((?!auth).*)',
  ],
};
