import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { AddSupplierDcResponse } from '@/lib/types/supplier-dc';
import { toast } from '@/hooks/use-toast';
import { SupplierDc } from '../schemas';
import { QueryKeyString } from '@/lib/types';

export const useAddSupplierDc = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<AddSupplierDcResponse, Error, SupplierDc>({
    mutationFn: async (supplierDc) => {
      const response = await APIService.addSupplierDc({ supplierDc });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Supplier DC created',
        description:
          'The Supplier Delivery Challan has been created successfully',
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.SUPPLIER_DCS],
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the Supplier DC',
        description:
          'An error occurred while creating the Supplier Delivery Challan',
        variant: 'destructive',
      });
      console.error('Failed to create the Supplier DC: ', err);
    },
  });

  return mutation;
};
