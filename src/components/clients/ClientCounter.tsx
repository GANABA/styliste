import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientCounterProps {
  current: number;
  limit: number;
  planName: string;
}

export function ClientCounter({ current, limit, planName }: ClientCounterProps) {
  // Toute valeur négative ou null/undefined signifie "illimité"
  const isUnlimited = limit == null || limit < 0 || limit === Infinity;
  const percentage = isUnlimited ? 0 : (current / limit) * 100;
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= limit;

  if (isUnlimited) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              {current} client{current > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-blue-700">
              Plan {planName} - Clients illimités
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAtLimit) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Limite atteinte: {current}/{limit} clients
            </p>
            <p className="text-sm mt-1">
              Passez au plan supérieur pour ajouter plus de clients
            </p>
          </div>
          <Link href="/dashboard/settings/subscription">
            <Button size="sm" variant="default">
              Mettre à niveau
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (isNearLimit) {
    return (
      <Alert>
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium text-orange-900">
              {current}/{limit} clients ({Math.round(percentage)}% utilisé)
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Vous approchez de votre limite - Plan {planName}
            </p>
          </div>
          <Link href="/dashboard/settings/subscription">
            <Button size="sm" variant="outline">
              Mettre à niveau
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {current}/{limit} clients
          </p>
          <p className="text-xs text-gray-500 mt-1">Plan {planName}</p>
        </div>
        <div className="w-32">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
