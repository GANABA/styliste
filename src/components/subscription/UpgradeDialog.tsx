'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UpgradeDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  targetPlan: string
  currentPlan: string
  isDowngrade?: boolean
  blockers?: string[]
}

export function UpgradeDialog({
  open,
  onClose,
  onSuccess,
  targetPlan,
  currentPlan,
  isDowngrade = false,
  blockers = [],
}: UpgradeDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const endpoint = isDowngrade
        ? '/api/subscriptions/downgrade'
        : '/api/subscriptions/upgrade'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: targetPlan }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.blockers) {
          toast.error('Impossible de changer de plan', { description: data.blockers[0] })
        } else {
          toast.error(data.error ?? 'Erreur lors du changement de plan')
        }
        return
      }

      toast.success(`Plan ${targetPlan} activé !`)
      onSuccess()
      onClose()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDowngrade ? 'Réduire votre abonnement' : 'Changer de plan'}
          </DialogTitle>
        </DialogHeader>

        {blockers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600 font-medium">
              Impossible de downgrader : vous devez d&apos;abord réduire votre usage.
            </p>
            <ul className="list-disc pl-4 space-y-1">
              {blockers.map((b, i) => (
                <li key={i} className="text-sm text-gray-700">{b}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Vous passez du plan <strong>{currentPlan}</strong> au plan{' '}
            <strong>{targetPlan}</strong>.{' '}
            {isDowngrade
              ? 'Les nouvelles limites seront appliquées immédiatement.'
              : 'Les nouvelles fonctionnalités sont disponibles immédiatement.'}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          {blockers.length === 0 && (
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'En cours...' : 'Confirmer'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
