'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MeasurementRecordForm } from '@/components/measurements/MeasurementRecordForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
}

interface MeasurementTemplate {
  id: string;
  name: string;
  fields: any;
}

export default function RecordMeasurementsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: ['client', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${params.id}`);

      if (!response.ok) {
        throw new Error('Client non trouvé');
      }

      return response.json();
    },
  });

  const { data: templates, isLoading: templatesLoading } = useQuery<MeasurementTemplate[]>({
    queryKey: ['measurement-templates'],
    queryFn: async () => {
      const response = await fetch('/api/measurement-templates');

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des templates');
      }

      return response.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { templateId: string; measurements: Record<string, number> }) => {
      const response = await fetch('/api/client-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: params.id,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'enregistrement");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Mesures enregistrées avec succès');
      queryClient.invalidateQueries({ queryKey: ['client-measurements', params.id] });
      router.push(`/dashboard/clients/${params.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isLoading = clientLoading || templatesLoading;

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

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="default" className="min-h-[44px]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Client non trouvé
        </div>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/clients/${params.id}`}>
            <Button variant="ghost" size="default" className="min-h-[44px]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prendre les mesures</h1>
            <p className="text-sm text-gray-500 mt-1">{client.name}</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Ruler className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-900 font-medium mb-2">
            Aucun template de mesures disponible
          </p>
          <p className="text-sm text-yellow-700 mb-4">
            Créez d&apos;abord un template de mesures pour pouvoir enregistrer les mesures de vos clients
          </p>
          <Link href="/dashboard/measurements/templates/new">
            <Button>Créer un template</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/clients/${params.id}`}>
          <Button variant="ghost" size="default" className="min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prendre les mesures</h1>
          <p className="text-sm text-gray-500 mt-1">{client.name}</p>
        </div>
      </div>

      {/* Form */}
      <MeasurementRecordForm
        templates={templates}
        onSubmit={(data) => saveMutation.mutate(data)}
        isSubmitting={saveMutation.isPending}
      />
    </div>
  );
}
