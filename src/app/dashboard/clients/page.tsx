'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/useDebounce';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientTable } from '@/components/clients/ClientTable';
import { ClientCounter } from '@/components/clients/ClientCounter';
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
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

interface ClientsResponse {
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  limitInfo: {
    current: number;
    limit: number;
    planName: string;
  };
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ClientsResponse>({
    queryKey: ['clients', { search: debouncedSearch, filter, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (filter === 'archived') {
        params.append('archived', 'true');
      }

      const response = await fetch(`/api/clients?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des clients');
      }

      return response.json();
    },
  });

  const handleRestore = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Erreur lors de la restauration');
      toast.success('Client restauré avec succès');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch {
      toast.error('Erreur lors de la restauration du client');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos clients et leurs mesures
          </p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </Link>
      </div>

      {/* Client Counter */}
      {data?.limitInfo && (
        <ClientCounter
          current={data.limitInfo.current}
          limit={data.limitInfo.limit}
          planName={data.limitInfo.planName}
        />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, téléphone ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'active' | 'archived')}>
          <TabsList className="h-11">
            <TabsTrigger value="active" className="h-9">Actifs</TabsTrigger>
            <TabsTrigger value="archived" className="h-9">Archivés</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Une erreur est survenue lors du chargement des clients.
        </div>
      )}

      {isLoading ? (
        <ClientListSkeleton />
      ) : data?.clients.length === 0 ? (
        <EmptyState filter={filter} searchQuery={debouncedSearch} />
      ) : (
        <>
          {/* Mobile view - Cards (< 768px) */}
          <div className="block md:hidden space-y-3">
            {data?.clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>

          {/* Desktop view - Table (≥ 768px) */}
          <div className="hidden md:block">
            <ClientTable
              clients={data?.clients || []}
              onRestore={filter === 'archived' ? handleRestore : undefined}
            />
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-500">
                Page {data.pagination.page} sur {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ClientListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

function EmptyState({ filter, searchQuery }: { filter: string; searchQuery: string }) {
  if (searchQuery) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">Aucun client trouvé pour &ldquo;{searchQuery}&rdquo;</p>
        <p className="text-sm text-gray-500 mt-1">
          Essayez avec un autre terme de recherche
        </p>
      </div>
    );
  }

  if (filter === 'archived') {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">Aucun client archivé</p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-gray-600 font-medium">Aucun client pour le moment</p>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Commencez par ajouter votre premier client
      </p>
      <Link href="/dashboard/clients/new">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </Link>
    </div>
  );
}
