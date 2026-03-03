'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CreateOrderInput, UpdateOrderInput, OrderWithRelations, FabricProvidedBy, UrgencyLevel } from '@/types/orders'
import { AlertCircle } from 'lucide-react'

interface Client {
  id: string
  name: string
  phone: string
}

interface OrderFormProps {
  mode: 'create' | 'edit'
  initialData?: OrderWithRelations
  onSubmit: (data: CreateOrderInput | UpdateOrderInput) => Promise<void>
}

const GARMENT_TYPES = [
  'Robe de soirée', 'Robe traditionnelle', 'Costume', 'Complet 3 pièces',
  'Tailleur', 'Boubou', 'Caftan', 'Ensemble 2 pièces', 'Pantalon + veste',
  'Robe de mariée', 'Vêtement enfant', 'Autre',
]

function formatDateInput(date?: Date | string | null): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export function OrderForm({ mode, initialData, onSubmit }: OrderFormProps) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    clientId:         initialData?.clientId ?? '',
    garmentType:      initialData?.garmentType ?? '',
    description:      initialData?.description ?? '',
    notes:            initialData?.notes ?? '',
    promisedDate:     formatDateInput(initialData?.promisedDate),
    urgencyLevel:     (initialData?.urgencyLevel ?? 'NORMAL') as UrgencyLevel,
    fabricProvidedBy: (initialData?.fabricProvidedBy ?? 'CLIENT') as FabricProvidedBy,
    fabricReceivedDate: formatDateInput(initialData?.fabricReceivedDate),
    fabricDescription: initialData?.fabricDescription ?? '',
    totalPrice:        initialData ? String(initialData.totalPrice) : '',
    advanceAmount:     initialData ? String(initialData.advanceAmount) : '',
  })

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => setClients(data.clients ?? []))
      .catch(() => {})
  }, [])

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.promisedDate) {
      setError('La date promise est obligatoire')
      return
    }
    if (!form.totalPrice || isNaN(Number(form.totalPrice))) {
      setError('Le prix total est obligatoire')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...(mode === 'create' ? { clientId: form.clientId } : {}),
        garmentType:       form.garmentType,
        description:       form.description || undefined,
        notes:             form.notes || undefined,
        promisedDate:      form.promisedDate,
        urgencyLevel:      form.urgencyLevel,
        fabricProvidedBy:  form.fabricProvidedBy,
        fabricReceivedDate: form.fabricReceivedDate || undefined,
        fabricDescription: form.fabricDescription || undefined,
        totalPrice:        Number(form.totalPrice),
        advanceAmount:     form.advanceAmount ? Number(form.advanceAmount) : 0,
      }
      await onSubmit(payload)
    } catch (err: any) {
      if (err.message === 'CAPACITY_EXCEEDED') {
        setError('Limite de 15 commandes actives atteinte. Livrez ou annulez des commandes d\'abord.')
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Client (seulement en création) */}
      {mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Client <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.clientId}
            onChange={set('clientId')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[44px]"
          >
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
            ))}
          </select>
        </div>
      )}

      {/* Type de vêtement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Type de vêtement <span className="text-red-500">*</span>
        </label>
        <input
          required
          list="garment-types"
          value={form.garmentType}
          onChange={set('garmentType')}
          placeholder="Ex : Robe de soirée"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[44px]"
        />
        <datalist id="garment-types">
          {GARMENT_TYPES.map((t) => <option key={t} value={t} />)}
        </datalist>
      </div>

      {/* Date promise + Urgence */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date promise <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="date"
            value={form.promisedDate}
            onChange={set('promisedDate')}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Urgence</label>
          <select
            value={form.urgencyLevel}
            onChange={set('urgencyLevel')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[44px]"
          >
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Élevée</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tissu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tissu fourni par</label>
        <div className="flex gap-3">
          {(['CLIENT', 'STYLIST'] as FabricProvidedBy[]).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fabricProvidedBy"
                value={v}
                checked={form.fabricProvidedBy === v}
                onChange={set('fabricProvidedBy')}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">{v === 'CLIENT' ? 'Le client' : 'Moi'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date réception tissu */}
      {form.fabricProvidedBy === 'CLIENT' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date réception tissu
          </label>
          <input
            type="date"
            value={form.fabricReceivedDate}
            onChange={set('fabricReceivedDate')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[44px]"
          />
        </div>
      )}

      {/* Prix */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Prix total (FCFA) <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="number"
            min="0"
            value={form.totalPrice}
            onChange={set('totalPrice')}
            placeholder="Ex : 25000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Avance (FCFA)</label>
          <input
            type="number"
            min="0"
            value={form.advanceAmount}
            onChange={set('advanceAmount')}
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[44px]"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          placeholder="Détails du modèle, coupes, couleurs..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Notes internes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes internes
        </label>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          placeholder="Notes pour vous uniquement..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 min-h-[44px]"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 min-h-[44px]"
        >
          {isSubmitting
            ? mode === 'create' ? 'Création...' : 'Enregistrement...'
            : mode === 'create' ? 'Créer la commande' : 'Enregistrer'
          }
        </Button>
      </div>
    </form>
  )
}
