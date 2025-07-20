import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

// Hook for uploading files to an enquiry
export const useUploadEnquiryFiles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ enquiryId, files }: { enquiryId: string; files: FileList }) => {
      // Use the correct API method that expects files (FileList)
      const result = await apiService.uploadEnquiryFiles({ enquiryId, files });
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate both the enquiry details and the general enquiries list
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ENQUIRIES, variables.enquiryId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ENQUIRIES] });
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

// Hook for downloading an enquiry file
export const useDownloadEnquiryFile = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ enquiryId, fileId, filename }: { enquiryId: string; fileId: string; filename: string }) => {
      // API now only needs enquiryId and fileId
      const blob = await apiService.downloadEnquiryFile({ enquiryId, fileId });

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

// Hook for deleting an enquiry file
export const useDeleteEnquiryFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ enquiryId, fileId }: { enquiryId: string; fileId: string }) => {
      return await apiService.deleteEnquiryFile({ enquiryId, fileId });
    },
    onSuccess: (data, variables) => {
      // Invalidate both the enquiry details and the general enquiries list
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ENQUIRIES, variables.enquiryId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ENQUIRIES] });
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
