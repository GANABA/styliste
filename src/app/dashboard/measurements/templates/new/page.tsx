'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MeasurementTemplateForm, TemplateFormData } from '@/components/measurements/MeasurementTemplateForm';
import { toast } from 'sonner';

export default function NewMeasurementTemplatePage() {
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const response = await fetch('/api/measurement-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du template');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Template créé avec succès');
      router.push('/dashboard/measurements/templates');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/measurements/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau template</h1>
          <p className="text-sm text-gray-500 mt-1">
            Créez un modèle de prise de mesures personnalisé
          </p>
        </div>
      </div>

      {/* Form */}
      <MeasurementTemplateForm
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
