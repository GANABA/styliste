'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

      {/* Stats placeholder - Sprint 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Clients</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Disponible Sprint 2</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Commandes actives</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Disponible Sprint 3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Chiffre d'affaires</CardDescription>
            <CardTitle className="text-3xl">0 FCFA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Disponible Sprint 4</p>
          </CardContent>
        </Card>
      </div>

      {/* Account info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
            <CardDescription>Vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <span className="text-sm text-gray-900">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Rôle:</span>
              <span className="text-sm text-gray-900">{session?.user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Stylist ID:</span>
              <span className="text-sm text-gray-900 font-mono text-xs">
                {session?.user?.stylistId || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochaines fonctionnalités</CardTitle>
            <CardDescription>
              Ces fonctionnalités seront disponibles dans les prochains sprints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-gray-700">Gestion des clients et mesures</span>
                <span className="ml-auto text-xs text-gray-500">Sprint 2</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-gray-700">Gestion des commandes</span>
                <span className="ml-auto text-xs text-gray-500">Sprint 3</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-300" />
                <span className="text-gray-700">Paiements et planning</span>
                <span className="ml-auto text-xs text-gray-500">Sprint 4</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-200" />
                <span className="text-gray-700">Portfolio et notifications</span>
                <span className="ml-auto text-xs text-gray-500">Sprint 5</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-100" />
                <span className="text-gray-700">Dashboard admin</span>
                <span className="ml-auto text-xs text-gray-500">Sprint 6</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
