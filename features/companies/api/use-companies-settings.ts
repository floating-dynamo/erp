import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import APIService from '@/services/api';
import { QueryKeyString } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch my companies for settings management
 * @returns Query object with my companies data
 */
export const useMyCompanies = () => {
  return useQuery({
    queryKey: [QueryKeyString.COMPANIES, 'my-companies'],
    queryFn: async () => {
      const response = await APIService.getMyCompanies();
      return response;
    },
  });
};

/**
 * Hook to set active company
 * @returns Mutation object for setting active company
 */
export const useSetActiveCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (companyId: string) => {
      return await APIService.setActiveCompany({ companyId });
    },
    onSuccess: (data) => {
      // Invalidate my companies query to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: [QueryKeyString.COMPANIES, 'my-companies'] 
      });
      
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