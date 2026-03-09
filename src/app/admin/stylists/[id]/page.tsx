import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Mail, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

async function getStylist(id: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/admin/stylists/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function AdminStylistDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  const stylist = await getStylist(params.id)
  if (!stylist) notFound()

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/admin/stylists" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{stylist.name}</h1>
            <p className="text-sm text-gray-500">{stylist.email}</p>
          </div>
          <Badge variant={stylist.suspended ? 'destructive' : 'secondary'}>
            {stylist.suspended ? 'Suspendu' : 'Actif'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="h-4 w-4" />
            Plan : <span className="font-medium text-gray-900">{stylist.plan}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            Inscrit le : <span className="font-medium text-gray-900">
              {format(new Date(stylist.createdAt), 'd MMM yyyy', { locale: fr })}
            </span>
          </div>
          {stylist.stylist?.city && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              {stylist.stylist.city}
            </div>
          )}
          {stylist.stylist?.businessName && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              {stylist.stylist.businessName}
            </div>
          )}
        </div>

        {stylist.stylist?._count && (
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{stylist.stylist._count.clients}</p>
              <p className="text-xs text-gray-500">Clients</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{stylist.stylist._count.orders}</p>
              <p className="text-xs text-gray-500">Commandes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{stylist.stylist._count.portfolioItems}</p>
              <p className="text-xs text-gray-500">Portfolio</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
