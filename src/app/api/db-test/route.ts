import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test simple de connexion DB
    await prisma.$queryRaw`SELECT 1 as test`;

    return NextResponse.json({
      status: 'OK',
      message: 'Database connection works!',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
