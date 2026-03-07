'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, ArrowRight, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  mobileMoneyProvider: string | null;
  paymentDate: string;
  notes: string | null;
  paymentStatus: string;
  order: {
    id: string;
    orderNumber: string;
    garmentType: string;
    totalPrice: number;
    client: { id: string; name: string };
  };
}

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount / 100)) + ' FCFA';
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

const TYPE_LABELS: Record<string, string> = {
  ADVANCE: 'Avance',
  PARTIAL: 'Partiel',
  FINAL: 'Solde',
  REFUND: 'Remboursement',
};

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement',
};

const TYPE_COLORS: Record<string, string> = {
  ADVANCE: 'bg-blue-100 text-blue-700 border-blue-200',
  PARTIAL: 'bg-orange-100 text-orange-700 border-orange-200',
  FINAL: 'bg-green-100 text-green-700 border-green-200',
  REFUND: 'bg-red-100 text-red-700 border-red-200',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/payments')
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (paymentId: string) => {
    const res = await fetch(`/api/payments/${paymentId}/receipt`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recu-${paymentId.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historique de tous vos encaissements
        </p>
      </div>

      {/* Total récapitulatif */}
      <Card className="border-green-100 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-green-700 font-medium">
            Total encaissé (toutes périodes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-800">{formatFCFA(total)}</p>
          <p className="text-xs text-green-600 mt-1">{payments.length} paiement(s) enregistré(s)</p>
        </CardContent>
      </Card>

      {/* Liste paiements */}
      {loading ? (
        <div className="text-center py-10 text-sm text-gray-400">Chargement...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <CreditCard className="h-12 w-12 mx-auto text-gray-200" />
          <p className="text-gray-500">Aucun paiement enregistré</p>
          <p className="text-sm text-gray-400">
            Enregistrez des paiements depuis la fiche d&apos;une commande
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-xl border p-4 flex items-start gap-4"
            >
              {/* Infos paiement */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn('text-xs border', TYPE_COLORS[payment.paymentType])}>
                    {TYPE_LABELS[payment.paymentType] || payment.paymentType}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                    {payment.mobileMoneyProvider && ` · ${payment.mobileMoneyProvider}`}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">{formatDate(payment.paymentDate)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{formatFCFA(payment.amount)}</span>
                </div>

                {/* Lien commande */}
                <Link
                  href={`/dashboard/orders/${payment.order.id}`}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <span className="font-mono">{payment.order.orderNumber}</span>
                  <span className="text-gray-400">·</span>
                  <span>{payment.order.client.name}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{payment.order.garmentType}</span>
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Link>
              </div>

              {/* Bouton reçu */}
              <button
                onClick={() => handleDownload(payment.id)}
                title="Télécharger le reçu PDF"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 shrink-0"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
