import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useEnquiries = ({ customerId }: { customerId?: string }) => {
  const query = useQuery({
    queryKey: ["enquiries", customerId],
    queryFn: async () => {
      const response = await APIService.getEnquiries({ customerId });

      if (!response) {
        return null;
      }

      const { enquiries } = response;
      return enquiries;
    },
  });

  return query;
};
