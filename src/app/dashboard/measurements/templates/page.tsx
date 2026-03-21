'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MeasurementField {
  name: string;
  label: string;
  unit: string;
  required: boolean;
}

interface MeasurementTemplate {
  id: string;
  name: string;
  fields: MeasurementField[];
  usageCount: number;
  createdAt: string;
}

export default function MeasurementTemplatesPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: templates, isLoading } = useQuery<MeasurementTemplate[]>({
    queryKey: ['measurement-templates'],
    queryFn: async () => {
      const response = await fetch('/api/measurement-templates');

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des templates');
      }

      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/measurement-templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['measurement-templates'] });
      setDeletingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setDeletingId(null);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="page-title">Templates de mesures</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos modèles de prises de mesures
          </p>
        </div>
        <Link href="/dashboard/measurements/templates/new">
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau template
          </Button>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-stone-800">
          <strong>3 templates par défaut</strong> sont automatiquement créés (Homme, Femme,
          Enfant). Vous pouvez les modifier ou créer vos propres templates personnalisés.
        </p>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {template.fields.length} champ
                        {template.fields.length > 1 ? 's' : ''}
                      </Badge>
                      {template.usageCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {template.usageCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">Champs:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {template.fields.slice(0, 3).map((field) => (
                      <li key={field.name} className="flex items-center gap-2">
                        <span className="text-gray-400">•</span>
                        <span>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </li>
                    ))}
                    {template.fields.length > 3 && (
                      <li className="text-gray-500 italic">
                        +{template.fields.length - 3} autre
                        {template.fields.length - 3 > 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/measurements/templates/${template.id}/edit`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeletingId(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce template ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {template.usageCount > 0 ? (
                            <>
                              Ce template est utilisé par {template.usageCount} mesure
                              {template.usageCount > 1 ? 's' : ''}. Il sera archivé mais les
                              mesures existantes seront conservées.
                            </>
                          ) : (
                            <>
                              Ce template n&apos;est pas encore utilisé. Il sera supprimé
                              définitivement.
                            </>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingId(null)}>
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(template.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleteMutation.isPending && deletingId === template.id}
                        >
                          {deleteMutation.isPending && deletingId === template.id
                            ? 'Suppression...'
                            : 'Supprimer'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 font-medium">Aucun template pour le moment</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Créez votre premier template de mesures
          </p>
          <Link href="/dashboard/measurements/templates/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau template
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
