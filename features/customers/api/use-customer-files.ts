import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

// Hook for uploading files to a customer
export const useUploadCustomerFiles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ customerId, files }: { customerId: string; files: FileList }) => {
      // Use the correct API method that expects files (FileList)
      const result = await apiService.uploadCustomerFiles({ customerId, files });
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate both the customer details and the general customers list
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.CUSTOMERS, variables.customerId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.CUSTOMERS] });
      toast({
        title: 'Files Uploaded',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
    },
  });
};

// Hook for downloading a customer file
export const useDownloadCustomerFile = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ customerId, fileId, filename }: { customerId: string; fileId: string; filename: string }) => {
      // API now only needs customerId and fileId
      const blob = await apiService.downloadCustomerFile({ customerId, fileId });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Use the filename passed to the hook for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      window.URL.revokeObjectURL(url);

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Download Started',
        description: 'Your file download has started.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error.message,
      });
    },
  });
};

// Hook for deleting a customer file
export const useDeleteCustomerFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ customerId, fileId }: { customerId: string; fileId: string }) => {
      return await apiService.deleteCustomerFile({ customerId, fileId });
    },
    onSuccess: (data, variables) => {
      // Invalidate both the customer details and the general customers list
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.CUSTOMERS, variables.customerId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.CUSTOMERS] });
      toast({
        title: 'File Deleted',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error.message,
      });
    },
  });
};