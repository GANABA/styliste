import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users, ShoppingBag, ImageIcon, Store, Mail, CheckCircle2, Ban } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

async function getStylist(id: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/admin/stylists/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

const PLAN_BADGE: Record<string, string> = {
  'Découverte': 'bg-stone-100 text-stone-600 border-stone-200',
  'Standard':   'bg-amber-50 text-amber-700 border-amber-200',
  'Pro':        'bg-amber-100 text-amber-800 border-amber-300',
  'Premium':    'bg-amber-400 text-stone-950 border-amber-500',
}

export default async function AdminStylistDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const stylist = await getStylist(params.id)
  if (!stylist) notFound()

  const initials = stylist.name
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'S'

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Retour */}
      <Link
        href="/admin/stylists"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>

      {/* ── Carte profil ── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {/* Header coloré */}
        <div className="h-16 bg-gradient-to-r from-stone-900 to-stone-700 relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
          />
        </div>

        {/* Avatar + infos */}
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-7 mb-4">
            {/* Avatar */}
            <div className="h-14 w-14 rounded-xl bg-amber-400 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
              <span className="text-xl font-black text-stone-950" style={{ fontFamily: 'var(--font-playfair)' }}>
                {initials}
              </span>
            </div>
            {/* Status */}
            <span className={cn(
              'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border',
              stylist.suspended
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            )}>
              {stylist.suspended
                ? <><Ban className="h-3 w-3" /> Suspendu</>
                : <><CheckCircle2 className="h-3 w-3" /> Actif</>
              }
            </span>
          </div>

          <h1 className="text-lg font-black text-stone-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            {stylist.name}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">{stylist.email}</p>
        </div>

        {/* Méta infos */}
        <div className="border-t border-stone-100 px-5 py-4 grid grid-cols-2 gap-3">
          {[
            {
              icon: Store,
              label: 'Plan',
              value: (
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', PLAN_BADGE[stylist.plan] ?? 'bg-stone-100 text-stone-600 border-stone-200')}>
                  {stylist.plan}
                </span>
              ),
            },
            {
              icon: Calendar,
              label: 'Inscrit le',
              value: format(new Date(stylist.createdAt), 'd MMM yyyy', { locale: fr }),
            },
            ...(stylist.stylist?.city ? [{
              icon: MapPin,
              label: 'Ville',
              value: stylist.stylist.city,
            }] : []),
            ...(stylist.stylist?.businessName ? [{
              icon: Mail,
              label: 'Atelier',
              value: stylist.stylist.businessName,
            }] : []),
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-3.5 w-3.5 text-stone-400" />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-semibold">{label}</p>
                <div className="text-sm font-medium text-stone-800 mt-0.5">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        {stylist.stylist?._count && (
          <div className="border-t border-stone-100 grid grid-cols-3 divide-x divide-stone-100">
            {[
              { icon: Users,       label: 'Clients',    value: stylist.stylist._count.clients },
              { icon: ShoppingBag, label: 'Commandes',  value: stylist.stylist._count.orders },
              { icon: ImageIcon,   label: 'Portfolio',  value: stylist.stylist._count.portfolioItems },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-1">
                <Icon className="h-4 w-4 text-stone-300 mb-1" />
                <p className="text-2xl font-black text-stone-900 tabular-nums">{value}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-semibold">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
