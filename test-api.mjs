import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

try {
  // Simple test
  const count = await prisma.stylist.count();
  console.log('Stylist count:', count);

  const first = await prisma.stylist.findFirst({
    select: { id: true, slug: true, businessName: true }
  });
  console.log('First stylist:', first);

  // Test portfolioItem
  const piCount = await prisma.portfolioItem.count();
  console.log('PortfolioItem count:', piCount);

  // Test notification
  const nCount = await prisma.notification.count();
  console.log('Notification count:', nCount);

  // Test the full query
  const stylists = await prisma.stylist.findMany({
    where: {
      slug: { not: null },
      deletedAt: null,
    },
    select: { id: true, slug: true },
    take: 3,
  });
  console.log('Stylists with slug:', stylists);

} catch (e) {
  console.error('ERROR:', e.message);
  console.error('STACK:', e.stack?.slice(0, 500));
} finally {
  await prisma.$disconnect();
}
