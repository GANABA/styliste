'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PortfolioItemPublic } from '@/types/portfolio'

interface PortfolioGalleryProps {
  items: PortfolioItemPublic[]
}

export function PortfolioGallery({ items }: PortfolioGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Aucune création publiée pour le moment.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setLightboxIndex(i)}
            className="group aspect-square bg-gray-100 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl ?? item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-6 w-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i! - 1) }}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {lightboxIndex < items.length - 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => i! + 1) }}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={items[lightboxIndex].imageUrl}
              alt={items[lightboxIndex].title}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <p className="text-white text-center mt-3 font-medium">
              {items[lightboxIndex].title}
            </p>
            {items[lightboxIndex].description && (
              <p className="text-white/60 text-center text-sm mt-1">
                {items[lightboxIndex].description}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
