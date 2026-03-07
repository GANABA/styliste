'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CalendarDays, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  garmentType: string;
  status: string;
  promisedDate: string;
  client: { id: string; name: string };
}

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function getWeekLabel(date: Date): string {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(d);
  return `Semaine du ${fmt(monday)} au ${fmt(sunday)}`;
}

function getWeekKey(date: Date): string {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return monday.toISOString().split('T')[0];
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
  QUOTE: {
    label: 'Devis',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
  },
  IN_PROGRESS: {
    label: 'En cours',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  READY: {
    label: 'Prête',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
    dotClass: 'bg-green-500',
  },
};

export default function CalendarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On récupère les commandes non livrées/annulées, triées par date promise
    fetch('/api/orders?planning=1')
      .then((r) => r.json())
      .then((data) => {
        // Filtrer et trier côté client si l'API retourne tout
        const active = (data.orders ?? []).filter(
          (o: Order) => o.status !== 'DELIVERED' && o.status !== 'CANCELED'
        );
        active.sort(
          (a: Order, b: Order) =>
            new Date(a.promisedDate).getTime() - new Date(b.promisedDate).getTime()
        );
        setOrders(active);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueOrders = orders.filter((o) => new Date(o.promisedDate) < today);

  // Grouper par semaine
  const weekGroups: Record<string, { label: string; orders: Order[] }> = {};
  for (const order of orders) {
    const d = new Date(order.promisedDate);
    const key = getWeekKey(d);
    if (!weekGroups[key]) {
      weekGroups[key] = { label: getWeekLabel(d), orders: [] };
    }
    weekGroups[key].orders.push(order);
  }
  const sortedWeeks = Object.entries(weekGroups).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vos commandes en cours classées par date de livraison promise. Les commandes en <span className="text-red-600 font-medium">rouge</span> ont dépassé leur date limite.
        </p>
      </div>

      {/* Alerte retards */}
      {!loading && overdueOrders.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">
              {overdueOrders.length} commande(s) en retard
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              La date promise est dépassée pour ces commandes.
            </p>
          </div>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">Chargement...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <CalendarDays className="h-14 w-14 mx-auto text-gray-200" />
          <p className="text-gray-500 font-medium">Aucune commande à planifier</p>
          <p className="text-sm text-gray-400">
            Toutes vos commandes sont livrées ou vous n&apos;en avez pas encore.
          </p>
          <Link href="/dashboard/orders/new" className="inline-block mt-2 text-sm text-blue-600 underline">
            Créer une commande
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedWeeks.map(([weekKey, { label, orders: weekOrders }]) => (
            <div key={weekKey}>
              {/* Titre semaine */}
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {label}
              </h2>

              <div className="space-y-2">
                {weekOrders.map((order) => {
                  const promisedDate = new Date(order.promisedDate);
                  const isOverdue = promisedDate < today;
                  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.QUOTE;

                  return (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center gap-3 bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow group"
                    >
                      {/* Indicateur statut */}
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          isOverdue ? 'bg-red-500' : statusCfg.dotClass
                        )}
                      />

                      {/* Date */}
                      <div className="shrink-0 text-center w-12">
                        <p className="text-xs font-bold text-gray-900">
                          {new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(promisedDate)}
                        </p>
                        <p className="text-xs text-gray-400 uppercase">
                          {new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(promisedDate)}
                        </p>
                      </div>

                      {/* Infos commande */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.garmentType}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{order.client.name}</p>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isOverdue ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                            En retard
                          </Badge>
                        ) : (
                          <Badge className={cn('text-xs border', statusCfg.badgeClass)}>
                            {statusCfg.label}
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
