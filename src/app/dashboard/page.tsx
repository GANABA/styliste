'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Users, ShoppingBag, Banknote, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {session?.user?.name} !
        </h1>
        <p className="text-muted-foreground mt-2">
          Voici votre tableau de bord Styliste.com
        </p>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/clients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-100 hover:border-blue-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Clients</CardDescription>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle className="text-3xl">—</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-blue-600 font-medium">
                Gérer les clients
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-100 hover:border-green-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Commandes actives</CardDescription>
                <ShoppingBag className="h-5 w-5 text-green-500" />
              </div>
              <CardTitle className="text-3xl">—</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600 font-medium">
                Gérer les commandes
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-gray-100 opacity-60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Chiffre d&apos;affaires</CardDescription>
              <Banknote className="h-5 w-5 text-gray-400" />
            </div>
            <CardTitle className="text-3xl text-gray-400">— FCFA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Disponible Sprint 4</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links + Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès rapide</CardTitle>
            <CardDescription>Les sections disponibles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/clients">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Gestion des clients
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/measurements/templates">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Templates de mesures
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-green-500" />
                  Gestion des commandes
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roadmap</CardTitle>
            <CardDescription>Fonctionnalités en cours et à venir</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-gray-700">Authentification & Compte</span>
                <span className="ml-auto text-xs text-green-600 font-medium">✓ Sprint 1</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-gray-700">Clients & Mesures</span>
                <span className="ml-auto text-xs text-green-600 font-medium">✓ Sprint 2</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-gray-700">Commandes & Photos</span>
                <span className="ml-auto text-xs text-green-600 font-medium">✓ Sprint 3</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Paiements & Planning</span>
                <span className="ml-auto text-xs text-gray-400">Sprint 4</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Portfolio & Notifications</span>
                <span className="ml-auto text-xs text-gray-400">Sprint 5</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
