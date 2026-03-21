'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ImageIcon, Plus, ExternalLink, Info, Eye } from 'lucide-react'
import { PortfolioItem } from '@prisma/client'
import { PortfolioItemCard } from '@/components/portfolio/PortfolioItemCard'
import { PortfolioUploadForm } from '@/components/portfolio/PortfolioUploadForm'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function PortfolioPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [stylistSlug, setStylistSlug] = useState<string | null>(null)

  const fetchItems = () => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchItems() }, [])

  useEffect(() => {
    fetch('/api/stylists/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.slug) setStylistSlug(data.slug) })
      .catch(() => {})
  }, [])

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished }),
    })
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, isPublished } : i))
      toast.success(isPublished ? 'Photo publiée' : 'Photo dépubliée')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette photo du portfolio ?')) return
    const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Photo supprimée')
    }
  }

  const publishedCount = items.filter((i) => i.isPublished).length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? '…' : `${publishedCount} photo${publishedCount !== 1 ? 's' : ''} publiée${publishedCount !== 1 ? 's' : ''} sur ${items.length}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {stylistSlug && (
            <Link
              href={`/${stylistSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-xl text-stone-600 hover:bg-stone-50 hover:text-amber-600 hover:border-amber-300 transition-all"
            >
              <Eye className="h-4 w-4" />
              Mon portfolio public
            </Link>
          )}
          {items.length < 50 && (
            <Button onClick={() => setShowUpload(!showUpload)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          )}
        </div>
      </div>

      {/* Lien mobile */}
      {stylistSlug && (
        <Link
          href={`/${stylistSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden flex items-center gap-2 px-4 py-3 text-sm border border-border rounded-xl text-stone-600 hover:bg-stone-50 bg-white"
        >
          <ExternalLink className="h-4 w-4 shrink-0 text-amber-500" />
          Voir mon portfolio public
        </Link>
      )}

      {/* Formulaire upload */}
      {showUpload && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Nouvelle photo</h2>
          <PortfolioUploadForm
            onSuccess={() => { setShowUpload(false); fetchItems() }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Avertissement photos en brouillon */}
      {items.length > 0 && publishedCount === 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <span>
            Vos photos sont en <strong>Brouillon</strong>, non visibles publiquement.
            Survolez une photo et cliquez sur l&apos;icône <strong>œil</strong> pour publier.
          </span>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-stone-300" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Aucune photo dans votre portfolio</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez vos créations pour attirer de nouveaux clients.
            </p>
          </div>
          <Button onClick={() => setShowUpload(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <PortfolioItemCard
              key={item.id}
              item={item}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
