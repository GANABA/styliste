'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CreateOrderInput, UpdateOrderInput, OrderWithRelations, FabricProvidedBy, UrgencyLevel } from '@/types/orders'
import { AlertCircle, Search } from 'lucide-react'

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
  'Robe de soirée', 'Robe traditionnelle', 'Robe de mariée',
  'Costume', 'Complet 3 pièces', 'Tailleur',
  'Boubou', 'Caftan', 'Grand boubou',
  'Ensemble 2 pièces', 'Pantalon + veste',
  'Vêtement enfant', 'Autre',
]

function formatDateInput(date?: Date | string | null): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

function formatFCFA(amount: number): string {
  if (!amount || isNaN(amount)) return ''
  return new Intl.NumberFormat('fr-FR').format(amount)
}

export function OrderForm({ mode, initialData, onSubmit }: OrderFormProps) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [garmentType, setGarmentType] = useState(initialData?.garmentType ?? '')
  const [isCustomGarment, setIsCustomGarment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    clientId:           initialData?.clientId ?? '',
    description:        initialData?.description ?? '',
    notes:              initialData?.notes ?? '',
    promisedDate:       formatDateInput(initialData?.promisedDate),
    urgencyLevel:       (initialData?.urgencyLevel ?? 'NORMAL') as UrgencyLevel,
    fabricProvidedBy:   (initialData?.fabricProvidedBy ?? 'CLIENT') as FabricProvidedBy,
    fabricReceivedDate: formatDateInput(initialData?.fabricReceivedDate),
    fabricDescription:  initialData?.fabricDescription ?? '',
    totalPrice:         initialData ? String(initialData.totalPrice) : '',
    advanceAmount:      initialData ? String(initialData.advanceAmount) : '',
  })

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => setClients(data.clients ?? []))
      .catch(() => setError('Impossible de charger la liste des clients. Rechargez la page.'))
  }, [])

  // Vérifier si le type initial est dans la liste prédéfinie
  useEffect(() => {
    if (initialData?.garmentType && !GARMENT_TYPES.includes(initialData.garmentType)) {
      setIsCustomGarment(true)
    }
  }, [initialData])

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch)
  )

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const totalPrice = Number(form.totalPrice) || 0
  const advanceAmount = Number(form.advanceAmount) || 0
  const balanceDue = Math.max(0, totalPrice - advanceAmount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'create' && !form.clientId) {
      setError('Veuillez sélectionner un client')
      return
    }
    if (!garmentType.trim()) {
      setError('Le type de vêtement est obligatoire')
      return
    }
    if (!form.promisedDate) {
      setError('La date promise est obligatoire')
      return
    }
    if (!form.totalPrice || isNaN(Number(form.totalPrice))) {
      setError('Le prix total est obligatoire')
      return
    }
    if (advanceAmount > totalPrice) {
      setError('L\'avance ne peut pas dépasser le prix total')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...(mode === 'create' ? { clientId: form.clientId } : {}),
        garmentType:        garmentType.trim(),
        description:        form.description || undefined,
        notes:              form.notes || undefined,
        promisedDate:       form.promisedDate,
        urgencyLevel:       form.urgencyLevel,
        fabricProvidedBy:   form.fabricProvidedBy,
        fabricReceivedDate: form.fabricReceivedDate || undefined,
        fabricDescription:  form.fabricDescription || undefined,
        totalPrice:         totalPrice,
        advanceAmount:      advanceAmount,
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
          <div className="relative">
            {selectedClient ? (
              <div className="flex items-center justify-between border border-input rounded-lg px-3 py-2.5 min-h-[44px] bg-white">
                <div>
                  <span className="text-sm font-medium text-gray-900">{selectedClient.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{selectedClient.phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedClient(null); setForm(f => ({...f, clientId: ''})); setClientSearch(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Changer
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={clientSearch}
                    onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true); }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="w-full border border-input rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[44px]"
                  />
                </div>
                {showClientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-input rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <p className="px-3 py-2.5 text-sm text-gray-500">
                        {clients.length === 0 ? 'Aucun client. Créez-en un d\'abord.' : 'Aucun résultat'}
                      </p>
                    ) : (
                      filteredClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedClient(c)
                            setForm(f => ({ ...f, clientId: c.id }))
                            setShowClientDropdown(false)
                            setClientSearch('')
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 text-left"
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="text-gray-400 text-xs">{c.phone}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Type de vêtement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Type de vêtement <span className="text-red-500">*</span>
        </label>
        {!isCustomGarment ? (
          <div className="space-y-2">
            <select
              value={GARMENT_TYPES.includes(garmentType) ? garmentType : ''}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustomGarment(true)
                  setGarmentType('')
                } else {
                  setGarmentType(e.target.value)
                }
              }}
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[44px] bg-white"
            >
              <option value="">Sélectionner un type</option>
              {GARMENT_TYPES.filter(t => t !== 'Autre').map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__custom__">Autre (saisir librement)</option>
            </select>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              autoFocus
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
              placeholder="Ex : Djellaba, Complet pagne..."
              className="flex-1 border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => { setIsCustomGarment(false); setGarmentType(''); }}
              className="text-xs text-gray-500 hover:text-gray-700 px-2"
            >
              Liste
            </button>
          </div>
        )}
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
            className="w-full border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Urgence</label>
          <select
            value={form.urgencyLevel}
            onChange={set('urgencyLevel')}
            className="w-full border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[44px] bg-white"
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
        <div className="flex gap-4">
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
              <span className="text-sm text-gray-700">{v === 'CLIENT' ? 'Le client' : 'Moi (styliste)'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date réception tissu */}
      {form.fabricProvidedBy === 'CLIENT' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date de réception du tissu
          </label>
          <input
            type="date"
            value={form.fabricReceivedDate}
            onChange={set('fabricReceivedDate')}
            className="w-full border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[44px]"
          />
        </div>
      )}

      {/* Prix */}
      <div className="space-y-3">
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
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Avance (FCFA)</label>
            <input
              type="number"
              min="0"
              max={form.totalPrice || undefined}
              value={form.advanceAmount}
              onChange={set('advanceAmount')}
              placeholder="0"
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[44px]"
            />
          </div>
        </div>

        {/* Reste à payer (dynamique) */}
        {totalPrice > 0 && (
          <div className="rounded-lg bg-gray-50 border px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">Reste à payer</span>
            <span className={`text-sm font-semibold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {balanceDue > 0
                ? `${new Intl.NumberFormat('fr-FR').format(balanceDue)} FCFA`
                : 'Soldé'}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description du modèle</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          placeholder="Détails du modèle, coupes, couleurs, motifs..."
          rows={3}
          className="w-full border border-input rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
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
          placeholder="Notes personnelles, rappels... (non visibles par le client)"
          rows={2}
          className="w-full border border-input rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
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
