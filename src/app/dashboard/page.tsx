'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Users, ShoppingBag, Banknote, ArrowRight, CheckCircle2,
  AlertTriangle, CalendarDays, Plus, ChevronDown, TrendingUp
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Period = '7d' | '30d' | '3m' | '12m' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  '7d':  '7 jours',
  '30d': '30 jours',
  '3m':  '3 mois',
  '12m': '12 mois',
  'all': 'Tout',
}

interface DashboardStats {
  activeOrders: number
  readyOrders: number
  overdueOrders: number
  revenue: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    garmentType: string
    status: string
    promisedDate: string
    client: { id: string; name: string }
  }>
  upcomingDeadlines: Array<{
    id: string
    orderNumber: string
    garmentType: string
    status: string
    promisedDate: string
    client: { id: string; name: string }
  }>
}

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount / 100)) + ' FCFA'
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(date))
}

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  QUOTE:       { label: 'Devis',    dot: 'bg-stone-400' },
  IN_PROGRESS: { label: 'En cours', dot: 'bg-amber-400' },
  READY:       { label: 'Prête',    dot: 'bg-emerald-400' },
  DELIVERED:   { label: 'Livrée',   dot: 'bg-stone-300' },
  CANCELED:    { label: 'Annulée',  dot: 'bg-red-400' },
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('30d')
  const [showPeriodMenu, setShowPeriodMenu] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/stats?period=${period}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [period])

  const firstName = session?.user?.name?.split(' ')[0] ?? 'vous'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
            Bonjour, {firstName} ✦
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Voici l&apos;état de votre atelier
          </p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="flex items-center gap-1.5 bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle commande</span>
          <span className="sm:hidden">Nouveau</span>
        </Link>
      </div>

      {/* ── Alerte retards ── */}
      {!loading && stats && stats.overdueOrders > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <span className="font-semibold">{stats.overdueOrders} commande(s) en retard</span>
            {' '}— livraison urgente requise.
          </p>
          <Link href="/dashboard/calendar" className="ml-auto text-xs text-red-500 hover:text-red-600 underline shrink-0">
            Planning
          </Link>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Commandes actives */}
        <Link href="/dashboard/orders?status=IN_PROGRESS">
          <div className="group rounded-2xl border border-border bg-card hover:border-amber-300 dark:hover:border-amber-400/30 hover:shadow-md transition-all duration-200 p-5 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commandes actives</p>
              <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            {loading ? <Skeleton className="h-9 w-16" /> : (
              <p className="text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                {stats?.activeOrders ?? 0}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">En cours + prêtes</p>
          </div>
        </Link>

        {/* Prêtes à livrer */}
        <Link href="/dashboard/orders?status=READY">
          <div className="group rounded-2xl border border-border bg-card hover:border-emerald-300 dark:hover:border-emerald-400/30 hover:shadow-md transition-all duration-200 p-5 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prêtes à livrer</p>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-400/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            {loading ? <Skeleton className="h-9 w-16" /> : (
              <p className="text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                {stats?.readyOrders ?? 0}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">À remettre au client</p>
          </div>
        </Link>

        {/* CA */}
        <div className="relative">
          <Link href="/dashboard/payments">
            <div className="group rounded-2xl border border-border bg-card hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md transition-all duration-200 p-5 cursor-pointer h-full">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chiffre d&apos;affaires</p>
                <div className="h-8 w-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              {loading ? <Skeleton className="h-7 w-32" /> : (
                <p className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {formatFCFA(stats?.revenue ?? 0)}
                </p>
              )}
              <button
                onClick={(e) => { e.preventDefault(); setShowPeriodMenu(!showPeriodMenu) }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1.5 transition-colors"
              >
                {PERIOD_LABELS[period]}
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </Link>
          {showPeriodMenu && (
            <div className="absolute top-full left-0 z-20 mt-1.5 bg-card rounded-xl shadow-lg border border-border py-1.5 min-w-[150px]">
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setPeriod(key); setShowPeriodMenu(false) }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors',
                    period === key && 'text-amber-500 font-semibold'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Commandes récentes + Échéances ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Commandes récentes */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Commandes récentes</h2>
            <Link href="/dashboard/orders" className="text-xs text-amber-500 hover:text-amber-600 font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))
            ) : !stats?.recentOrders.length ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Aucune commande récente
              </div>
            ) : (
              stats.recentOrders.slice(0, 5).map((order) => {
                const sc = STATUS_CONFIG[order.status]
                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {order.client.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{order.client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.garmentType}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('h-1.5 w-1.5 rounded-full', sc.dot)} />
                      <span className="text-xs text-muted-foreground">{sc.label}</span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Échéances à venir */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Échéances — 7 jours</h2>
            <Link href="/dashboard/calendar" className="text-xs text-amber-500 hover:text-amber-600 font-medium">
              Planning →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : !stats?.upcomingDeadlines.length ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Aucune échéance dans les 7 prochains jours
              </div>
            ) : (
              stats.upcomingDeadlines.slice(0, 5).map((order) => {
                const daysLeft = Math.ceil(
                  (new Date(order.promisedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
                const isUrgent = daysLeft <= 1
                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      'h-9 w-9 rounded-xl flex flex-col items-center justify-center text-center shrink-0',
                      isUrgent ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-400/10'
                    )}>
                      <span className={cn('text-[10px] font-bold leading-none', isUrgent ? 'text-red-500' : 'text-amber-500')}>
                        {daysLeft <= 0 ? 'Auj.' : `J-${daysLeft}`}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{order.client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.garmentType}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(order.promisedDate)}</span>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Accès rapides ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Accès rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/clients/new',   icon: Users,       label: 'Nouveau client',   color: 'text-blue-500   bg-blue-50   dark:bg-blue-500/10' },
            { href: '/dashboard/orders/new',    icon: ShoppingBag, label: 'Nouvelle commande', color: 'text-amber-500  bg-amber-50  dark:bg-amber-400/10' },
            { href: '/dashboard/payments',      icon: Banknote,    label: 'Paiements',         color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
            { href: '/dashboard/calendar',      icon: CalendarDays,label: 'Planning',          color: 'text-rose-500   bg-rose-50   dark:bg-rose-500/10' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card hover:border-border/80 hover:shadow-sm p-4 text-center transition-all duration-150 group"
            >
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', color)}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-foreground group-hover:text-amber-500 transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
