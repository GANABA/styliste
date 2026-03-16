import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'OK',
    message: 'API route works!',
    timestamp: new Date().toISOString(),
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
    }
  });
}
