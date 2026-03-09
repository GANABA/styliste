'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface PortfolioUploadFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function PortfolioUploadForm({ onSuccess, onCancel }: PortfolioUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [clientConsent, setClientConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      if (description.trim()) formData.append('description', description.trim())
      if (tags.trim()) formData.append('tags', tags.trim())
      formData.append('clientConsent', String(clientConsent))

      const res = await fetch('/api/portfolio', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'PLAN_UPGRADE_REQUIRED') {
          toast.error('Portfolio disponible sur le plan Pro uniquement')
        } else if (err.error === 'PORTFOLIO_LIMIT_REACHED') {
          toast.error('Limite de 50 photos atteinte')
        } else if (err.error === 'STORAGE_NOT_CONFIGURED') {
          toast.error('Stockage non configuré. Configurer Cloudflare R2 dans les variables d\'environnement Vercel.')
        } else {
          toast.error("Erreur lors de l'upload")
        }
        return
      }

      toast.success('Photo ajoutée au portfolio')
      onSuccess()
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Zone de drop */}
      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
        >
          <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Cliquez pour choisir une photo</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — 5 MB max</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Aperçu" className="w-full h-48 object-cover rounded-xl" />
          <button
            type="button"
            onClick={() => { setFile(null); setPreview(null) }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 border flex items-center justify-center text-gray-600 shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Titre <span className="text-red-500">*</span></Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Robe de soirée dorée"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-gray-600">Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Courte description (optionnel)"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-gray-600">Tags (séparés par virgule)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ex : soirée, robe, pagne"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={clientConsent}
          onChange={(e) => setClientConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm text-gray-600">
          Le client a donné son accord pour publier cette photo
        </span>
      </label>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={!file || !title.trim() || isSubmitting}>
          {isSubmitting ? 'Upload...' : 'Ajouter au portfolio'}
        </Button>
      </div>
    </form>
  )
}
