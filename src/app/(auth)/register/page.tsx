'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { registerSchema, RegisterFormData } from '@/lib/validations'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) {
        setError(result.error || 'Une erreur est survenue')
        return
      }

      router.push('/login?registered=true')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const PERKS = [
    '14 jours d\'essai Pro gratuit',
    'Aucune carte bancaire requise',
    'Annulation à tout moment',
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Panneau gauche — desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-950 flex-col justify-between p-12">
        <Link href="/" className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
          Styliste<span className="text-amber-400">.com</span>
        </Link>
        <div className="space-y-5">
          <h2 className="text-4xl font-black text-white leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Rejoignez 200+ stylistes qui ont digitalisé leur atelier.
          </h2>
          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-stone-300 text-sm">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-stone-600 text-sm">© 2025 Styliste.com — Bénin 🇧🇯</p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo mobile */}
          <Link href="/" className="lg:hidden block text-center text-2xl font-black" style={{ fontFamily: 'var(--font-playfair)' }}>
            Styliste<span className="text-amber-500">.com</span>
          </Link>

          <div>
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
              Créer votre compte
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Créez votre espace styliste en 2 minutes.</p>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nom complet</label>
              <input
                type="text"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="Jean Dupont"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="jean@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-background text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Confirmation */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirmer le mot de passe</label>
              <input
                type={showPwd ? 'text' : 'password'}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 bg-stone-900 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Création...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
              Se connecter
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            En vous inscrivant, vous acceptez nos conditions d&apos;utilisation.
          </p>
        </div>
      </div>
    </div>
  )
}
