import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcrypt';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        // Récupérer l'utilisateur avec son stylist
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            stylist: true,
          },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Vérifier le mot de passe
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Retourner les données utilisateur
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          stylistId: user.stylist?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Première connexion - ajouter les données custom au token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.stylistId = user.stylistId;
      }
      return token;
    },
    async session({ session, token }) {
      // Ajouter les données custom à la session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.stylistId = token.stylistId as string | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
