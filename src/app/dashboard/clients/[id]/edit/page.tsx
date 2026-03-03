'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientForm, ClientFormData } from '@/components/clients/ClientForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: client, isLoading, error } = useQuery<Client>({
    queryKey: ['client', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Client non trouvé');
        }
        throw new Error('Erreur lors du chargement du client');
      }

      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await fetch(`/api/clients/${params.id}`, {
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
      toast.success('Client modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['client', params.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      router.push(`/dashboard/clients/${params.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
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

  if (error || !client) {
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
          {error instanceof Error ? error.message : 'Client non trouvé'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/clients/${params.id}`}>
          <Button variant="ghost" size="default" className="min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le client</h1>
          <p className="text-sm text-gray-500 mt-1">{client.name}</p>
        </div>
      </div>

      {/* Form */}
      <ClientForm
        defaultValues={{
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          address: client.address || '',
          city: client.city || '',
          notes: client.notes || '',
        }}
        onSubmit={(data) => updateMutation.mutate(data)}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
