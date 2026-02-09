import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force Node.js runtime (bcrypt et Prisma ne fonctionnent pas en Edge)
export const runtime = 'nodejs';
// Force dynamic rendering (pas de pre-rendering au build)
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
