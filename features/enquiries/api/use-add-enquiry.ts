import APIService from "@/services/api";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { AddCustomerResponse } from "@/lib/types/customer";
import { toast } from "@/hooks/use-toast";
import { Enquiry } from "../schemas";
import { QueryKeyString } from "@/lib/types";

export const useAddEnquiry = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<AddCustomerResponse, Error, Enquiry>({
    mutationFn: async (enquiry) => {
      const response = await APIService.addEnquiry({ enquiry });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Enquiry created",
        description: "The enquiry has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ENQUIRIES] });
    },
    onError: (err) => {
      toast({
        title: "Failed to create the enquiry",
        description: "An error occurred while creating the enquiry",
        variant: "destructive",
      });
      console.error("Failed to create the enquiry: ", err);
    },
  });

  return mutation;
};
