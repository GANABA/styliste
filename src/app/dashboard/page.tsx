'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Users, ShoppingBag, Banknote, ArrowRight, CheckCircle2,
  Clock, AlertTriangle, CalendarDays, Plus, CreditCard, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Period = '7d' | '30d' | '3m' | '12m' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  '7d':  '7 derniers jours',
  '30d': '30 derniers jours',
  '3m':  '3 derniers mois',
  '12m': '12 derniers mois',
  'all': 'Tout le temps',
};

interface DashboardStats {
  activeOrders: number;
  readyOrders: number;
  overdueOrders: number;
  revenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    garmentType: string;
    status: string;
    promisedDate: string;
    client: { id: string; name: string };
  }>;
  upcomingDeadlines: Array<{
    id: string;
    orderNumber: string;
    garmentType: string;
    status: string;
    promisedDate: string;
    client: { id: string; name: string };
  }>;
}

function formatFCFA(amount: number): string {
  // revenue vient de paiements (centimes) → diviser par 100
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount / 100)) + ' FCFA';
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(date));
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  QUOTE:      { label: 'Devis',    className: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS:{ label: 'En cours', className: 'bg-blue-100 text-blue-700' },
  READY:      { label: 'Prête',    className: 'bg-green-100 text-green-700' },
  DELIVERED:  { label: 'Livrée',   className: 'bg-purple-100 text-purple-700' },
  CANCELED:   { label: 'Annulée',  className: 'bg-red-100 text-red-600' },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/stats?period=${period}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [period]);

  const firstName = session?.user?.name?.split(' ')[0] ?? 'vous';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {firstName} !</h1>
          <p className="text-sm text-muted-foreground mt-1">Voici l&apos;état de votre atelier</p>
        </div>
        <Link href="/dashboard/orders/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle commande</span>
          </Button>
        </Link>
      </div>

      {/* Alerte retards */}
      {!loading && stats && stats.overdueOrders > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{stats.overdueOrders} commande(s) en retard</span>
            {' '}— date promise dépassée, livraison urgente.
          </p>
          <Link href="/dashboard/calendar" className="ml-auto text-xs text-red-600 underline shrink-0">
            Voir le planning
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Commandes actives */}
        <Link href="/dashboard/orders?status=IN_PROGRESS">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-100 hover:border-blue-300">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs">
                <span>Commandes actives</span>
                <ShoppingBag className="h-4 w-4 text-blue-400" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-blue-700">{stats?.activeOrders ?? 0}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">En cours + prêtes</p>
            </CardContent>
          </Card>
        </Link>

        {/* Prêtes à livrer */}
        <Link href="/dashboard/orders?status=READY">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-100 hover:border-green-300">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs">
                <span>Prêtes à livrer</span>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-green-700">{stats?.readyOrders ?? 0}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">À remettre au client</p>
            </CardContent>
          </Card>
        </Link>

        {/* CA avec filtre de période */}
        <div className="relative">
          <Link href="/dashboard/payments">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-100 hover:border-purple-300 h-full">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs">
                  <span>Chiffre d&apos;affaires</span>
                  <Banknote className="h-4 w-4 text-purple-400" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className="text-xl font-bold text-purple-700 leading-tight">
                    {formatFCFA(stats?.revenue ?? 0)}
                  </p>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); setShowPeriodMenu(!showPeriodMenu); }}
                  className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 mt-1"
                >
                  {PERIOD_LABELS[period]}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </CardContent>
            </Card>
          </Link>
          {showPeriodMenu && (
            <div className="absolute top-full left-0 z-20 mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[160px]">
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setPeriod(key); setShowPeriodMenu(false); }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50',
                    period === key && 'text-purple-700 font-medium bg-purple-50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* En retard */}
        <Link href="/dashboard/calendar">
          <Card className={cn(
            'hover:shadow-md transition-shadow cursor-pointer',
            !loading && stats && stats.overdueOrders > 0
              ? 'border-red-200 hover:border-red-400 bg-red-50'
              : 'border-gray-100 hover:border-gray-300'
          )}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs">
                <span>En retard</span>
                <AlertTriangle className={cn('h-4 w-4', stats && stats.overdueOrders > 0 ? 'text-red-400' : 'text-gray-300')} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className={cn('text-3xl font-bold', stats && stats.overdueOrders > 0 ? 'text-red-600' : 'text-gray-400')}>
                  {stats?.overdueOrders ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">Date promise dépassée</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes récentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Commandes récentes</CardTitle>
            <Link href="/dashboard/orders" className="text-xs text-blue-600 hover:underline">
              Tout voir
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !stats?.recentOrders.length ? (
              <div className="text-center py-6 space-y-2">
                <ShoppingBag className="h-8 w-8 mx-auto text-gray-200" />
                <p className="text-sm text-gray-500">Aucune commande encore</p>
                <Link href="/dashboard/orders/new">
                  <Button variant="outline" size="sm" className="mt-1">Créer une commande</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recentOrders.map((order) => {
                  const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.QUOTE;
                  return (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.garmentType}</p>
                        <p className="text-xs text-gray-500 truncate">{order.client.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn('text-xs border-0 font-normal', s.className)}>{s.label}</Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prochaines échéances */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Échéances (7 prochains jours)</CardTitle>
            <Link href="/dashboard/calendar" className="text-xs text-blue-600 hover:underline">
              Planning
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !stats?.upcomingDeadlines.length ? (
              <div className="text-center py-6 space-y-1">
                <CalendarDays className="h-8 w-8 mx-auto text-gray-200" />
                <p className="text-sm text-gray-500">Aucune échéance dans 7 jours</p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.upcomingDeadlines.map((order) => {
                  const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.QUOTE;
                  return (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 text-orange-700 shrink-0">
                        <span className="text-xs font-bold leading-tight text-center">{formatDate(order.promisedDate)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.garmentType}</p>
                        <p className="text-xs text-gray-500 truncate">{order.client.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn('text-xs border-0 font-normal', s.className)}>{s.label}</Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accès rapide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nouvelle commande', href: '/dashboard/orders/new', icon: Plus, color: 'text-blue-600 bg-blue-50' },
          { label: 'Clients', href: '/dashboard/clients', icon: Users, color: 'text-purple-600 bg-purple-50' },
          { label: 'Paiements', href: '/dashboard/payments', icon: CreditCard, color: 'text-green-600 bg-green-50' },
          { label: 'Planning', href: '/dashboard/calendar', icon: CalendarDays, color: 'text-orange-600 bg-orange-50' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-5 text-center">
                <div className={cn('p-2.5 rounded-lg', item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-gray-700">{item.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roadmap MVP</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Authentification & Compte', sprint: 'Sprint 1', done: true },
              { label: 'Clients & Mesures', sprint: 'Sprint 2', done: true },
              { label: 'Commandes & Photos', sprint: 'Sprint 3', done: true },
              { label: 'Paiements & Planning & Dashboard', sprint: 'Sprint 4', done: true },
              { label: 'Portfolio & Notifications email', sprint: 'Sprint 5', done: false },
              { label: 'Abonnements & Admin', sprint: 'Sprint 6', done: false },
            ].map((item) => (
              <li key={item.sprint} className="flex items-center gap-2">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-300 shrink-0" />
                )}
                <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                <span className={cn('ml-auto text-xs whitespace-nowrap shrink-0', item.done ? 'text-green-600 font-medium' : 'text-gray-400')}>
                  {item.done ? `✓ ${item.sprint}` : item.sprint}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
