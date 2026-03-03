'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientForm } from '@/components/clients/ClientForm';
import { toast } from 'sonner';

interface ClientFormData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export default function NewClientPage() {
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du client');
      }

      return response.json();
    },
    onSuccess: (client) => {
      toast.success('Client créé avec succès');
      router.push(`/dashboard/clients/${client.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="default" className="min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau client</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ajoutez un nouveau client à votre liste
          </p>
        </div>
      </div>

      {/* Form */}
      <ClientForm
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
