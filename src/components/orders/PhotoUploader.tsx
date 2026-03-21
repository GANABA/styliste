'use client'

import { useState, useRef } from 'react'
import { PhotoType } from '@prisma/client'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PhotoUploaderProps {
  orderId: string
  onUploadSuccess: () => void
}

const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  REFERENCE: 'Référence',
  FABRIC:    'Tissu',
  FITTING:   'Essayage',
  FINISHED:  'Fini',
}

const MAX_SIZE_MB = 5
const ACCEPTED = 'image/jpeg,image/png,image/webp'

export function PhotoUploader({ orderId, onUploadSuccess }: PhotoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [photoType, setPhotoType] = useState<PhotoType>('REFERENCE')
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setError(null)
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_SIZE_MB} MB)`)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format non supporté. Utilisez JPEG, PNG ou WebP.')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('photoType', photoType)
      if (caption) formData.append('caption', caption)

      const response = await fetch(`/api/orders/${orderId}/photos`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error === 'FILE_TOO_LARGE') throw new Error('Fichier trop volumineux (max 5 MB)')
        if (data.error === 'PHOTO_LIMIT_REACHED') throw new Error('Limite de 10 photos atteinte')
        throw new Error(data.error || 'Erreur upload')
      }

      setSelectedFile(null)
      setPreview(null)
      setCaption('')
      onUploadSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Zone de dépôt */}
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-input rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-colors"
        >
          <Upload className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Glissez une photo ou <span className="text-amber-600 font-medium">parcourir</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 5 MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-input">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Aperçu" className="w-full h-48 object-cover" />
          )}
          <button
            onClick={clearSelection}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="p-3 bg-gray-50 text-xs text-gray-500">
            <ImageIcon className="inline h-3 w-3 mr-1" />
            {selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
          </div>
        </div>
      )}

      {/* Type de photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type de photo</label>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PHOTO_TYPE_LABELS) as PhotoType[]).map((type) => (
            <button
              key={type}
              onClick={() => setPhotoType(type)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition-colors',
                photoType === type
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-stone-600 border-input hover:bg-stone-50'
              )}
            >
              {PHOTO_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div>
        <input
          type="text"
          placeholder="Légende (optionnel)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Bouton upload */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full min-h-[44px]"
      >
        {isUploading ? 'Upload en cours...' : 'Ajouter la photo'}
      </Button>
    </div>
  )
}
