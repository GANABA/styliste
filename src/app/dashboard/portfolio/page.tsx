'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ImageIcon, Plus, ExternalLink, Info } from 'lucide-react'
import { PortfolioItem } from '@prisma/client'
import { PortfolioItemCard } from '@/components/portfolio/PortfolioItemCard'
import { PortfolioUploadForm } from '@/components/portfolio/PortfolioUploadForm'
import { Button } from '@/components/ui/button'
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
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {publishedCount} photo{publishedCount !== 1 ? 's' : ''} publiée{publishedCount !== 1 ? 's' : ''} sur {items.length}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {session?.user && stylistSlug && (
            <Link
              href={`/${stylistSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
              Voir mon portfolio
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

      {/* Formulaire upload */}
      {showUpload && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Nouvelle photo</h2>
          <PortfolioUploadForm
            onSuccess={() => { setShowUpload(false); fetchItems() }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Lien vers portfolio public (mobile) */}
      {stylistSlug && (
        <Link
          href={`/${stylistSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden flex items-center gap-2 px-3 py-2.5 text-sm border rounded-lg text-gray-600 hover:bg-gray-50 bg-white"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          <span>Voir mon portfolio public</span>
        </Link>
      )}

      {/* Avertissement : photos non publiées */}
      {items.length > 0 && publishedCount === 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <span>
            Vos photos sont en <strong>Brouillon</strong> et ne sont pas visibles sur votre portfolio public.
            Survolez une photo et cliquez sur l&apos;icône <strong>œil</strong> pour la publier.
          </span>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <ImageIcon className="h-14 w-14 mx-auto text-gray-200" />
          <p className="text-gray-500 font-medium">Aucune photo dans votre portfolio</p>
          <p className="text-sm text-gray-400">
            Ajoutez des photos de vos créations pour attirer de nouveaux clients.
          </p>
          <Button onClick={() => setShowUpload(true)} size="sm" className="mt-2">
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
