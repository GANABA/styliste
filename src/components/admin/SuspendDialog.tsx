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

interface SuspendDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  userName: string
  isSuspended: boolean
}

export function SuspendDialog({
  open,
  onClose,
  onSuccess,
  userId,
  userName,
  isSuspended,
}: SuspendDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/stylists/${userId}/suspend`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur')
        return
      }

      toast.success(data.message)
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
            {isSuspended ? 'Réactiver le compte' : 'Suspendre le compte'}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {isSuspended ? (
            <>Voulez-vous réactiver le compte de <strong>{userName}</strong> ? Il pourra à nouveau se connecter.</>
          ) : (
            <>Voulez-vous suspendre le compte de <strong>{userName}</strong> ? Il ne pourra plus se connecter.</>
          )}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant={isSuspended ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'En cours...' : isSuspended ? 'Réactiver' : 'Suspendre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
