'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MeasurementTemplateForm, TemplateFormData } from '@/components/measurements/MeasurementTemplateForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface MeasurementTemplate {
  id: string;
  name: string;
  fields: any;
}

export default function EditMeasurementTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: template, isLoading, error } = useQuery<MeasurementTemplate>({
    queryKey: ['measurement-template', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/measurement-templates/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Template non trouvé');
        }
        throw new Error('Erreur lors du chargement du template');
      }

      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const response = await fetch(`/api/measurement-templates/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la modification');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Template modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['measurement-template', params.id] });
      queryClient.invalidateQueries({ queryKey: ['measurement-templates'] });
      router.push('/dashboard/measurements/templates');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/measurements/templates">
            <Button variant="ghost" size="default" className="min-h-[44px]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error instanceof Error ? error.message : 'Template non trouvé'}
        </div>
      </div>
    );
  }

  // Normalize fields structure (handle both {fields: [...]} and [...] formats)
  const fields = Array.isArray(template.fields)
    ? template.fields
    : template.fields.fields || [];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/measurements/templates">
          <Button variant="ghost" size="default" className="min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="page-title">Modifier le template</h1>
          <p className="text-sm text-gray-500 mt-1">{template.name}</p>
        </div>
      </div>

      {/* Form */}
      <MeasurementTemplateForm
        defaultValues={{
          name: template.name,
          fields,
        }}
        onSubmit={(data) => updateMutation.mutate(data)}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
