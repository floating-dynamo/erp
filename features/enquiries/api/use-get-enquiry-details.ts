import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useGetEnquiryDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: ["enquiries", id],
    queryFn: async () => {
      const enquiry = await APIService.getEnquiryById({ id });

      return enquiry;
    },
    enabled: !!id,
  });

  return query;
};
