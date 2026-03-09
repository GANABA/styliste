'use client'

import Link from 'next/link'
import { OrderWithRelations } from '@/types/orders'
import { OrderStatusBadge } from './OrderStatusBadge'
import { StatusTransitionButton } from './StatusTransitionButton'
import { OrderTimeline } from './OrderTimeline'
import { PhotoGallery } from './PhotoGallery'
import { PhotoUploader } from './PhotoUploader'
import { PaymentSummary } from '@/components/payments/PaymentSummary'
import { PaymentHistory } from '@/components/payments/PaymentHistory'
import { PaymentForm } from '@/components/payments/PaymentForm'
import { useOrderStatus } from '@/hooks/useOrderStatus'
import { useOrderPhotos } from '@/hooks/useOrderPhotos'
import { useOrderPayments } from '@/hooks/useOrderPayments'
import { useOrderNotifications } from '@/hooks/useOrderNotifications'
import { NotifyClientButton } from './NotifyClientButton'
import { NotificationHistory } from './NotificationHistory'
import { Pencil, Calendar, User, Scissors, Banknote, ChevronDown, ChevronUp, Plus, FileText, Bell } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OrderDetailProps {
  order: OrderWithRelations
  onRefresh: () => void
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Non définie'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date))
}

export function OrderDetail({ order, onRefresh }: OrderDetailProps) {
  const [showPhotos, setShowPhotos] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [showPayments, setShowPayments] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleDownloadInvoice = async () => {
    const res = await fetch(`/api/orders/${order.id}/invoice`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `facture-${order.orderNumber}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const { transition } = useOrderStatus(order.id, onRefresh)
  const { photos, refetch: refetchPhotos, deletePhoto } = useOrderPhotos(order.id)
  const { payments, refetch: refetchPayments } = useOrderPayments(order.id)
  const { notifications, sending, sendNotification } = useOrderNotifications(order.id)

  const balance = order.totalPrice - order.totalPaid

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-0.5">{order.orderNumber}</p>
            <h1 className="text-lg font-bold text-gray-900">{order.garmentType}</h1>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <NotifyClientButton
              hasEmail={!!order.client.email}
              orderStatus={order.status}
              paymentStatus={order.paymentStatus}
              onSend={sendNotification}
              sending={sending}
            />
            <button
              onClick={handleDownloadInvoice}
              title="Télécharger la facture PDF"
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
            </button>
            <Link
              href={`/dashboard/orders/${order.id}/edit`}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Infos clés */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4 text-gray-400 shrink-0" />
            <Link href={`/dashboard/clients/${order.clientId}`} className="hover:text-blue-600 truncate">
              {order.client.name}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{formatDate(order.promisedDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Scissors className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{order.fabricProvidedBy === 'CLIENT' ? 'Tissu client' : 'Tissu styliste'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Banknote className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="font-medium">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {/* Résumé paiement */}
        <div className="mt-3">
          <PaymentSummary
            totalPrice={order.totalPrice}
            totalPaid={order.totalPaid}
            paymentStatus={order.paymentStatus as 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED'}
          />
        </div>

        {/* Description */}
        {order.description && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{order.description}</p>
        )}
      </div>

      {/* Transition de statut */}
      <StatusTransitionButton
        currentStatus={order.status}
        orderId={order.id}
        onTransition={transition}
      />

      {/* Section Paiements */}
      <div className="bg-white rounded-xl border">
        <button
          onClick={() => setShowPayments(!showPayments)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <h2 className="font-semibold text-gray-900">
            Paiements <span className="text-gray-400 font-normal text-sm">({payments.length})</span>
          </h2>
          {showPayments ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>

        {showPayments && (
          <div className="px-5 pb-5 space-y-4">
            <PaymentHistory payments={payments} />
            {order.paymentStatus !== 'PAID' && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Enregistrer un paiement
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dialog PaymentForm */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          <PaymentForm
            orderId={order.id}
            balanceDue={balance}
            onSuccess={() => {
              setShowPaymentForm(false)
              refetchPayments()
              onRefresh()
            }}
            onCancel={() => setShowPaymentForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Photos */}
      <div className="bg-white rounded-xl border">
        <button
          onClick={() => setShowPhotos(!showPhotos)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <h2 className="font-semibold text-gray-900">
            Photos <span className="text-gray-400 font-normal text-sm">({photos.length})</span>
          </h2>
          {showPhotos ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>

        {showPhotos && (
          <div className="px-5 pb-5 space-y-4">
            <PhotoGallery
              photos={photos}
              onDelete={deletePhoto}
            />

            {photos.length < 10 && (
              <>
                <button
                  onClick={() => setShowUploader(!showUploader)}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {showUploader ? 'Masquer l\'upload' : '+ Ajouter une photo'}
                </button>
                {showUploader && (
                  <PhotoUploader
                    orderId={order.id}
                    onUploadSuccess={() => {
                      refetchPhotos()
                      setShowUploader(false)
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />
            Notifications <span className="text-gray-400 font-normal text-sm">({notifications.length})</span>
          </h2>
          {showNotifications ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {showNotifications && (
          <div className="px-5 pb-5">
            <NotificationHistory notifications={notifications} />
          </div>
        )}
      </div>

      {/* Historique */}
      <div className="bg-white rounded-xl border">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <h2 className="font-semibold text-gray-900">
            Historique <span className="text-gray-400 font-normal text-sm">({order.history.length})</span>
          </h2>
          {showHistory ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>

        {showHistory && (
          <div className="px-5 pb-5">
            <OrderTimeline history={order.history} />
          </div>
        )}
      </div>
    </div>
  )
}
