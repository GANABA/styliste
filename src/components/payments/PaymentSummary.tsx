'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentSummaryProps {
  totalPrice: number;    // en FCFA
  totalPaid: number;     // en FCFA
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
}

// totalPrice et totalPaid sont en FCFA — pas de division par 100
function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
}

const STATUS_CONFIG = {
  UNPAID:   { label: 'Non payé',    className: 'bg-red-100 text-red-700 border-red-200' },
  PARTIAL:  { label: 'Acompte versé', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  PAID:     { label: 'Soldé',       className: 'bg-green-100 text-green-700 border-green-200' },
  REFUNDED: { label: 'Remboursé',   className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export function PaymentSummary({ totalPrice, totalPaid, paymentStatus }: PaymentSummaryProps) {
  const balanceDue = Math.max(0, totalPrice - totalPaid);
  const status = STATUS_CONFIG[paymentStatus] ?? STATUS_CONFIG.UNPAID;

  return (
    <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Statut paiement</span>
        <Badge className={cn('border font-medium', status.className)}>
          {status.label}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Prix total</span>
          <span className="font-medium">{formatFCFA(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total payé</span>
          <span className={cn('font-medium', totalPaid > 0 ? 'text-green-600' : 'text-gray-400')}>
            {formatFCFA(totalPaid)}
          </span>
        </div>
        {balanceDue > 0 && (
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="font-semibold text-gray-700">Solde restant</span>
            <span className="font-bold text-red-600">{formatFCFA(balanceDue)}</span>
          </div>
        )}
        {paymentStatus === 'PAID' && (
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="font-semibold text-green-700">Commande soldée</span>
            <span className="text-green-600">✓</span>
          </div>
        )}
      </div>
    </div>
  );
}
