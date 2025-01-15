import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useEnquiries = () => {
  const query = useQuery({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const response = await APIService.getEnquiries();

      if (!response) {
        return null;
      }

      const { enquiries } = response;
      return enquiries;
    },
  });

  return query;
};
