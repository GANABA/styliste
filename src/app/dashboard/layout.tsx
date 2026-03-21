'use client';

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

  return (
    <ErrorBoundary>
      {/* h-screen + overflow-hidden : sidebar fixe, seul le main scroll */}
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col min-h-0 min-w-0">
          <Header onMenuClick={toggle} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
