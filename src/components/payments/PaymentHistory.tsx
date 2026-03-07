'use client';

import { Download, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

interface PaymentHistoryProps {
  payments: Payment[];
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
  ADVANCE: 'bg-blue-100 text-blue-700',
  PARTIAL: 'bg-orange-100 text-orange-700',
  FINAL: 'bg-green-100 text-green-700',
  REFUND: 'bg-red-100 text-red-700',
};

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        Aucun paiement enregistré
      </div>
    );
  }

  const handleDownloadReceipt = async (paymentId: string) => {
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
    <div className="space-y-2">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-start justify-between rounded-lg border p-3 bg-white gap-3"
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn('text-xs font-medium border-0', TYPE_COLORS[payment.paymentType])}>
                {TYPE_LABELS[payment.paymentType] || payment.paymentType}
              </Badge>
              <span className="text-xs text-gray-500">
                {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                {payment.mobileMoneyProvider && ` · ${payment.mobileMoneyProvider}`}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm">{formatFCFA(payment.amount)}</span>
              <span className="text-xs text-gray-400">{formatDate(payment.paymentDate)}</span>
            </div>
            {payment.notes && (
              <p className="text-xs text-gray-500 italic truncate">{payment.notes}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => handleDownloadReceipt(payment.id)}
            title="Télécharger le reçu"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
