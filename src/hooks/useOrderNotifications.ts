import { useState, useEffect, useCallback } from 'react'
import { Notification, NotificationType } from '@prisma/client'
import { toast } from 'sonner'

export function useOrderNotifications(orderId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const fetchNotifications = useCallback(() => {
    setLoading(true)
    fetch(`/api/notifications?orderId=${orderId}`)
      .then((r) => r.json())
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const sendNotification = async (type: NotificationType): Promise<boolean> => {
    setSending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'CLIENT_NO_EMAIL') {
          toast.error("Ce client n'a pas d'adresse email")
        } else if (err.error === 'PLAN_UPGRADE_REQUIRED') {
          toast.error('Notifications disponibles à partir du plan Standard')
        } else if (err.error === 'ORDER_ALREADY_PAID') {
          toast.error('La commande est déjà soldée')
        } else if (err.error === 'EMAIL_SEND_FAILED') {
          toast.error(`Échec envoi email : ${err.detail ?? 'erreur inconnue'}`, { duration: 8000 })
        } else {
          toast.error(`Erreur lors de l'envoi : ${err.error ?? 'erreur inconnue'}`)
        }
        return false
      }

      const data = await res.json()
      if (data.dryRun) {
        toast.warning('Email simulé — Resend non configuré (aucun email réel envoyé)', { duration: 6000 })
      } else {
        toast.success('Email envoyé avec succès')
      }
      fetchNotifications()
      return true
    } catch {
      toast.error("Erreur lors de l'envoi")
      return false
    } finally {
      setSending(false)
    }
  }

  return { notifications, loading, sending, sendNotification, refetch: fetchNotifications }
}
