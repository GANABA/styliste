'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const schema = z.object({
  amount: z.number().positive('Le montant doit être supérieur à 0'),
  paymentType: z.enum(['ADVANCE', 'PARTIAL', 'FINAL', 'REFUND']),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER']),
  mobileMoneyProvider: z.string().optional(),
  mobileMoneyNumber: z.string().optional(),
  notes: z.string().optional(),
  paymentDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PaymentFormProps {
  orderId: string;
  balanceDue: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PAYMENT_TYPES = [
  { value: 'ADVANCE', label: 'Avance' },
  { value: 'PARTIAL', label: 'Paiement partiel' },
  { value: 'FINAL', label: 'Solde final' },
  { value: 'REFUND', label: 'Remboursement' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
];

const MOBILE_OPERATORS = ['MTN', 'Moov', 'Orange'];

export function PaymentForm({ orderId, balanceDue, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentType: 'PARTIAL',
      paymentMethod: 'CASH',
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const paymentMethod = watch('paymentMethod');

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Convertir le montant en centimes
      const body = {
        ...data,
        amount: Math.round(data.amount * 100),
      };

      const res = await fetch(`/api/orders/${orderId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de l\'enregistrement');
      }

      toast.success('Paiement enregistré avec succès');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Montant */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">
          Montant (FCFA)
          {balanceDue > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              Solde restant : {new Intl.NumberFormat('fr-FR').format(Math.round(balanceDue))} FCFA
            </span>
          )}
        </Label>
        <Input
          id="amount"
          type="number"
          step="1"
          min="1"
          placeholder="ex: 5000"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Type de paiement */}
      <div className="space-y-1.5">
        <Label>Type de paiement</Label>
        <Select
          defaultValue="PARTIAL"
          onValueChange={(v) => setValue('paymentType', v as FormValues['paymentType'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Méthode de paiement */}
      <div className="space-y-1.5">
        <Label>Méthode de paiement</Label>
        <Select
          defaultValue="CASH"
          onValueChange={(v) => setValue('paymentMethod', v as FormValues['paymentMethod'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Champs Mobile Money conditionnels */}
      {paymentMethod === 'MOBILE_MONEY' && (
        <div className="space-y-3 rounded-md border p-3 bg-gray-50">
          <div className="space-y-1.5">
            <Label>Opérateur</Label>
            <Select onValueChange={(v) => setValue('mobileMoneyProvider', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'opérateur" />
              </SelectTrigger>
              <SelectContent>
                {MOBILE_OPERATORS.map((op) => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobileNumber">Numéro (optionnel)</Label>
            <Input
              id="mobileNumber"
              type="tel"
              placeholder="ex: +229 97 00 00 00"
              {...register('mobileMoneyNumber')}
            />
          </div>
        </div>
      )}

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="paymentDate">Date du paiement</Label>
        <Input
          id="paymentDate"
          type="date"
          {...register('paymentDate')}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Remarques sur ce paiement..."
          {...register('notes')}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
