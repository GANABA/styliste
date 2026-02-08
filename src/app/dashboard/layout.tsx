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
