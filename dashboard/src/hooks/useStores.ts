import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi } from '../api/stores';
import { CreateStoreRequest } from '../types/store';

const STORES_QUERY_KEY = ['stores'];

/**
 * Hook to fetch all stores with automatic polling
 */
export function useStores() {
  return useQuery({
    queryKey: STORES_QUERY_KEY,
    queryFn: storesApi.getAll,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}

/**
 * Hook to create a new store
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreRequest) => storesApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete a store
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storesApi.delete(id),
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });
}
