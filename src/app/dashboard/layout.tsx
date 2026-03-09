'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSidebarStore } from '@/store/useSidebarStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggle } = useSidebarStore();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!session?.user?.stylistId) return;

    // Vérifier si l'onboarding est complété
    fetch('/api/stylists/me/onboarding-status')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && !data.onboardingCompleted) {
          router.replace('/onboarding');
        }
      })
      .catch(() => {/* ignorer les erreurs réseau */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <Header onMenuClick={toggle} />

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
