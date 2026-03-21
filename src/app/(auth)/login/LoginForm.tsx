'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { loginSchema, LoginFormData } from '@/lib/validations'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
        return
      }

      const session = await getSession()
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        const onboardingRes = await fetch('/api/stylists/me/onboarding-status')
        const onboardingData = onboardingRes.ok ? await onboardingRes.json() : null
        router.push(onboardingData && !onboardingData.onboardingCompleted ? '/onboarding' : '/dashboard')
      }
      router.refresh()
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Panneau gauche décoratif — desktop uniquement */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-950 flex-col justify-between p-12">
        <Link href="/" className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
          Styliste<span className="text-amber-400">.com</span>
        </Link>
        <div className="space-y-4">
          <h2
            className="text-4xl font-black text-white leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Votre atelier vous attend.
          </h2>
          <p className="text-stone-400 text-lg">
            Connectez-vous pour retrouver vos clients, commandes et paiements.
          </p>
        </div>
        <div className="text-xs text-stone-600 space-y-1">
          <p>Aucune carte bancaire requise</p>
          <p>Annulation à tout moment</p>
        </div>
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
              Connexion
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Bienvenue, connectez-vous à votre atelier.</p>
          </div>

          {registered && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Compte créé ! Connectez-vous maintenant.
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Mot de passe</label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => { e.preventDefault(); alert('Fonctionnalité à venir') }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 bg-stone-900 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-amber-600 hover:text-amber-700 font-semibold">
              S&apos;inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
