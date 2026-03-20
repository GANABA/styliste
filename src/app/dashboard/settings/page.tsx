'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Phone, MapPin, Home, Store, Loader2, Check, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const settingsSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100),
  businessName: z.string().min(2, 'Minimum 2 caractères').max(100).optional().or(z.literal('')),
  phone: z.string().min(8, 'Numéro invalide').max(20),
  city: z.string().max(100).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface StylistProfile {
  id: string
  slug: string | null
  businessName: string | null
  phone: string | null
  city: string | null
  address: string | null
  logoUrl: string | null
  user: { name: string; email: string }
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<StylistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    fetch('/api/stylists/me')
      .then((r) => r.json())
      .then((data: StylistProfile) => {
        setProfile(data)
        reset({
          name: data.user.name ?? '',
          businessName: data.businessName ?? '',
          phone: data.phone ?? '',
          city: data.city ?? '',
          address: data.address ?? '',
        })
      })
      .catch(() => toast.error('Impossible de charger le profil'))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/stylists/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          businessName: data.businessName || undefined,
          phone: data.phone,
          city: data.city || undefined,
          address: data.address || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur lors de la sauvegarde')
      }

      const updated: StylistProfile = await res.json()
      setProfile(updated)
      reset({
        name: updated.user.name ?? '',
        businessName: updated.businessName ?? '',
        phone: updated.phone ?? '',
        city: updated.city ?? '',
        address: updated.address ?? '',
      })
      toast.success('Profil mis à jour')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const res = await fetch('/api/stylists/me/logo', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur upload')
      setProfile((p) => p ? { ...p, logoUrl: data.logoUrl } : p)
      toast.success('Logo mis à jour')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  const handleLogoDelete = async () => {
    setLogoUploading(true)
    try {
      const res = await fetch('/api/stylists/me/logo', { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
      setProfile((p) => p ? { ...p, logoUrl: null } : p)
      toast.success('Logo supprimé')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLogoUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les informations de votre profil et de votre atelier</p>
      </div>

      {/* Profil public */}
      {profile?.slug && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
          <Check className="h-4 w-4 shrink-0" />
          <span>
            Votre portfolio public est accessible sur{' '}
            <a
              href={`/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              styliste-pi.vercel.app/{profile.slug}
            </a>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Informations personnelles */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              Informations personnelles
            </CardTitle>
            <CardDescription>Votre nom affiché et vos coordonnées de contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom complet</Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input id="name" {...register('name')} placeholder="Jean Dupont" />
              )}
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">
                Téléphone <span className="text-red-500">*</span>
              </Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="phone" {...register('phone')} placeholder="+229 97 00 00 00" className="pl-9" />
                </div>
              )}
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Email (lecture seule) */}
            <div className="space-y-1.5">
              <Label className="text-gray-500">Email</Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input value={profile?.user.email ?? ''} disabled className="bg-gray-50 text-gray-500" />
              )}
              <p className="text-xs text-gray-400">L&apos;email ne peut pas être modifié</p>
            </div>
          </CardContent>
        </Card>

        {/* Informations atelier */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-500" />
              Votre atelier
            </CardTitle>
            <CardDescription>Ces informations apparaissent sur votre page portfolio publique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Nom de l&apos;atelier</Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input id="businessName" {...register('businessName')} placeholder="Atelier Dupont Couture" />
              )}
              {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">Ville</Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="city" {...register('city')} placeholder="Cotonou" className="pl-9" />
                </div>
              )}
              {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Adresse complète</Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="address" {...register('address')} placeholder="Haie Vive, Cotonou, Bénin" className="pl-9" />
                </div>
              )}
              {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Logo de l'atelier */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              Logo de l&apos;atelier
            </CardTitle>
            <CardDescription>
              Visible sur votre portfolio public et dans l&apos;annuaire (plan Pro et supérieur)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {/* Aperçu */}
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 bg-stone-50">
                {profile?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logoUrl} alt="Logo atelier" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-7 w-7 text-stone-300" />
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-white hover:bg-stone-50 transition-colors cursor-pointer ${logoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {logoUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  {profile?.logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleLogoChange}
                    disabled={logoUploading}
                  />
                </label>
                {profile?.logoUrl && (
                  <button
                    type="button"
                    onClick={handleLogoDelete}
                    disabled={logoUploading}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Supprimer le logo
                  </button>
                )}
                <p className="text-xs text-gray-400">JPEG, PNG ou WebP · 2 Mo max · Format carré recommandé</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || loading || !isDirty} className="min-w-32">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
