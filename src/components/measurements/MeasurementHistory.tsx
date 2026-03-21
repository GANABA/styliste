'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Ruler, Pencil, X, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface TemplateField {
  name: string;
  label: string;
  unit: string;
  required: boolean;
}

interface MeasurementTemplate {
  id: string;
  name: string;
  fields: TemplateField[] | { fields: TemplateField[] };
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

function normalizeFields(template: MeasurementTemplate): TemplateField[] {
  if (!template?.fields) return [];
  return Array.isArray(template.fields)
    ? template.fields
    : (template.fields as any).fields ?? [];
}

// Résout le label d'une clé de mesure depuis les champs du template
function resolveLabel(key: string, templateFields: TemplateField[]): { label: string; unit: string } {
  const field = templateFields.find((f) => f.name === key);
  if (field) return { label: field.label, unit: field.unit };
  // Champ personnalisé (custom_*)
  const cleanKey = key.replace(/^custom_/, '').replace(/_/g, ' ');
  return { label: cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1), unit: 'cm' };
}

// Carte de mesure avec édition inline
function MeasurementCard({
  measurement,
  onUpdated,
}: {
  measurement: ClientMeasurement;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const templateFields = normalizeFields(measurement.template);

  const startEdit = () => {
    const initial: Record<string, string> = {};
    Object.entries(measurement.measurements).forEach(([k, v]) => {
      initial[k] = String(v);
    });
    setValues(initial);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setValues({});
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const parsed: Record<string, number> = {};
      for (const [k, v] of Object.entries(values)) {
        const n = parseFloat(v);
        if (!isNaN(n) && n > 0) parsed[k] = n;
      }
      const res = await fetch(`/api/client-measurements/${measurement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ measurements: parsed }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      toast.success('Mesures mises à jour');
      setEditing(false);
      onUpdated();
    } catch {
      toast.error('Erreur lors de la mise à jour des mesures');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{measurement.template.name}</h4>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(measurement.measuredAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {Object.keys(measurement.measurements).length} mesure
                {Object.keys(measurement.measurements).length > 1 ? 's' : ''}
              </Badge>
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700"
                  onClick={startEdit}
                  title="Modifier les mesures"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Mesures */}
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t">
                {Object.entries(measurement.measurements).map(([key]) => {
                  const { label, unit } = resolveLabel(key, templateFields);
                  return (
                    <div key={key} className="space-y-1">
                      <p className="text-xs text-gray-500">{label}</p>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={values[key] ?? ''}
                          onChange={(e) =>
                            setValues((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="pr-10 h-8 text-sm"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          {unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Annuler
                </Button>
                <Button size="sm" onClick={saveEdit} disabled={saving}>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  {saving ? 'Sauvegarde...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t">
              {Object.entries(measurement.measurements).map(([key, value]) => {
                const { label, unit } = resolveLabel(key, templateFields);
                return (
                  <div key={key} className="space-y-1">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-base font-medium text-gray-900">
                      {value}{' '}
                      <span className="text-sm text-gray-500">{unit}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MeasurementHistory({ clientId }: MeasurementHistoryProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<MeasurementHistoryResponse>({
    queryKey: ['client-measurements', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/client-measurements/${clientId}?limit=10`);
      if (!response.ok) throw new Error("Erreur lors du chargement de l'historique");
      return response.json();
    },
  });

  const handleUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['client-measurements', clientId] });
  };

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
        <MeasurementCard
          key={measurement.id}
          measurement={measurement}
          onUpdated={handleUpdated}
        />
      ))}

      {data.pagination.total > data.measurements.length && (
        <p className="text-sm text-gray-500 text-center pt-2">
          Affichage de {data.measurements.length} sur {data.pagination.total} mesures
        </p>
      )}
    </div>
  );
}
