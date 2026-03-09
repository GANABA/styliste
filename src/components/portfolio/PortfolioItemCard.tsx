'use client'

import { PortfolioItem } from '@prisma/client'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PortfolioItemCardProps {
  item: PortfolioItem
  onTogglePublish: (id: string, isPublished: boolean) => void
  onDelete: (id: string) => void
}

export function PortfolioItemCard({ item, onTogglePublish, onDelete }: PortfolioItemCardProps) {
  return (
    <div className="group relative bg-white rounded-xl border overflow-hidden">
      {/* Image */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnailUrl ?? item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Badge statut */}
      <div className="absolute top-2 left-2">
        <Badge
          className={
            item.isPublished
              ? 'bg-green-100 text-green-700 border-green-200 text-xs'
              : 'bg-gray-100 text-gray-500 border-gray-200 text-xs'
          }
        >
          {item.isPublished ? 'Publié' : 'Brouillon'}
        </Badge>
      </div>

      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onTogglePublish(item.id, !item.isPublished)}
          title={item.isPublished ? 'Dépublier' : 'Publier'}
          className="w-8 h-8 rounded-lg bg-white/90 border flex items-center justify-center text-gray-600 hover:bg-white shadow-sm"
        >
          {item.isPublished
            ? <EyeOff className="h-4 w-4" />
            : <Eye className="h-4 w-4" />
          }
        </button>
        <button
          onClick={() => onDelete(item.id)}
          title="Supprimer"
          className="w-8 h-8 rounded-lg bg-white/90 border flex items-center justify-center text-red-500 hover:bg-white shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
        {item.tags.length > 0 && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{item.tags.join(', ')}</p>
        )}
      </div>
    </div>
  )
}
