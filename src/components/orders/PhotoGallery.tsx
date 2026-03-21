'use client'

import { useState } from 'react'
import { OrderPhoto, PhotoType } from '@/types/orders'
import { Trash2, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoGalleryProps {
  photos: OrderPhoto[]
  onDelete?: (photoId: string) => Promise<void>
  readonly?: boolean
}

const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  REFERENCE: 'Référence',
  FABRIC:    'Tissu',
  FITTING:   'Essayage',
  FINISHED:  'Fini',
}

const PHOTO_TYPE_COLORS: Record<PhotoType, string> = {
  REFERENCE: 'bg-gray-100 text-gray-600',
  FABRIC:    'bg-amber-100 text-amber-700',
  FITTING:   'bg-sky-100 text-sky-700',
  FINISHED:  'bg-green-100 text-green-700',
}

export function PhotoGallery({ photos, onDelete, readonly = false }: PhotoGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (photos.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">Aucune photo pour le moment</p>
    )
  }

  const handleDelete = async (photoId: string) => {
    if (!onDelete) return
    setDeletingId(photoId)
    try {
      await onDelete(photoId)
    } finally {
      setDeletingId(null)
    }
  }

  // Grouper par type
  const grouped = photos.reduce((acc, photo) => {
    if (!acc[photo.photoType]) acc[photo.photoType] = []
    ;(acc[photo.photoType] as OrderPhoto[]).push(photo)
    return acc
  }, {} as Partial<Record<PhotoType, OrderPhoto[]>>)

  return (
    <>
      <div className="space-y-4">
        {(Object.keys(grouped) as PhotoType[]).map((type) => (
          <div key={type}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {PHOTO_TYPE_LABELS[type]}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(grouped[type] ?? []).map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnailUrl ?? photo.photoUrl}
                    alt={photo.caption ?? PHOTO_TYPE_LABELS[photo.photoType]}
                    className="w-full h-full object-cover"
                  />

                  {/* Badge type */}
                  <span className={cn(
                    'absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-md font-medium opacity-0 group-hover:opacity-100 transition-opacity',
                    PHOTO_TYPE_COLORS[photo.photoType]
                  )}>
                    {PHOTO_TYPE_LABELS[photo.photoType]}
                  </span>

                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-1.5 gap-1.5 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setLightbox(photo.photoUrl)}
                      className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white"
                    >
                      <ZoomIn className="h-3.5 w-3.5 text-gray-700" />
                    </button>
                    {!readonly && onDelete && (
                      <button
                        onClick={() => handleDelete(photo.id)}
                        disabled={deletingId === photo.id}
                        className="w-7 h-7 rounded-lg bg-red-500/90 flex items-center justify-center hover:bg-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Photo en plein écran"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  )
}
