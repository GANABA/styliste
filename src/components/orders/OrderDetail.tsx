'use client'

import Link from 'next/link'
import { OrderWithRelations } from '@/types/orders'
import { OrderStatusBadge } from './OrderStatusBadge'
import { StatusTransitionButton } from './StatusTransitionButton'
import { OrderTimeline } from './OrderTimeline'
import { PhotoGallery } from './PhotoGallery'
import { PhotoUploader } from './PhotoUploader'
import { useOrderStatus } from '@/hooks/useOrderStatus'
import { useOrderPhotos } from '@/hooks/useOrderPhotos'
import { Pencil, Calendar, User, Scissors, Banknote, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface OrderDetailProps {
  order: OrderWithRelations
  onRefresh: () => void
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date))
}

export function OrderDetail({ order, onRefresh }: OrderDetailProps) {
  const [showPhotos, setShowPhotos] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [showUploader, setShowUploader] = useState(false)

  const { transition } = useOrderStatus(order.id, onRefresh)
  const { photos, refetch: refetchPhotos, deletePhoto } = useOrderPhotos(order.id)

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

        {/* Paiement */}
        {balance > 0 && (
          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-sm text-orange-700">
              Reste à payer : <span className="font-semibold">{formatPrice(balance)}</span>
              {order.advanceAmount > 0 && (
                <span className="text-orange-500 ml-1">
                  (avance : {formatPrice(order.advanceAmount)})
                </span>
              )}
            </p>
          </div>
        )}

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
