'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, Ruler } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MeasurementTemplate {
  id: string;
  name: string;
}

interface ClientMeasurement {
  id: string;
  measurements: Record<string, number>;
  measuredAt: string;
  template: MeasurementTemplate;
}

interface MeasurementHistoryResponse {
  measurements: ClientMeasurement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface MeasurementHistoryProps {
  clientId: string;
}

export function MeasurementHistory({ clientId }: MeasurementHistoryProps) {
  const { data, isLoading, error } = useQuery<MeasurementHistoryResponse>({
    queryKey: ['client-measurements', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/client-measurements/${clientId}?limit=10`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique");
      }

      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        Erreur lors du chargement de l&apos;historique des mesures
      </div>
    );
  }

  if (!data || data.measurements.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
        <Ruler className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Aucune mesure enregistrée</p>
        <p className="text-sm text-gray-500 mt-1">
          Les mesures de ce client apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.measurements.map((measurement) => (
        <Card key={measurement.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {measurement.template.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(measurement.measuredAt), 'dd MMMM yyyy à HH:mm', {
                      locale: fr,
                    })}
                  </p>
                </div>
                <Badge variant="secondary">
                  {Object.keys(measurement.measurements).length} mesure
                  {Object.keys(measurement.measurements).length > 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Measurements Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t">
                {Object.entries(measurement.measurements).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-xs text-gray-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {value} <span className="text-sm text-gray-500">cm</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination Info */}
      {data.pagination.total > data.measurements.length && (
        <p className="text-sm text-gray-500 text-center pt-2">
          Affichage de {data.measurements.length} sur {data.pagination.total} mesures
        </p>
      )}
    </div>
  );
}
