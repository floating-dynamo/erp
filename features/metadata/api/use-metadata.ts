import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import APIService from '@/services/api';
import { QueryKeyString, MetaDataType } from '@/lib/types';
import { UOM, Currency } from '../schemas';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch UOMs
 * @returns Query object with UOMs data
 */
export const useUOMs = () => {
  const query = useQuery({
    queryKey: [QueryKeyString.METADATA, MetaDataType.UOM],
    queryFn: async () => {
      const response = await APIService.getMetadata({ type: MetaDataType.UOM });
      return response?.uoms || [];
    },
  });

  return {
    uoms: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook to fetch Currencies
 * @returns Query object with Currencies data
 */
export const useCurrencies = () => {
  const query = useQuery({
    queryKey: [QueryKeyString.METADATA, MetaDataType.CURRENCY],
    queryFn: async () => {
      const response = await APIService.getMetadata({ type: MetaDataType.CURRENCY });
      return response?.currencies || [];
    },
  });

  return {
    currencies: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook to create or update UOM
 * @returns Mutation object for UOM upsert
 */
export const useUpsertUOM = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (uom: UOM) => {
      return await APIService.upsertUOM({ uom });
    },
    onSuccess: (data) => {
      // Invalidate metadata queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.METADATA] });
      
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
};

/**
 * Hook to create or update Currency
 * @returns Mutation object for Currency upsert
 */
export const useUpsertCurrency = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (currency: Currency) => {
      return await APIService.upsertCurrency({ currency });
    },
    onSuccess: (data) => {
      // Invalidate metadata queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.METADATA] });
      
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
};