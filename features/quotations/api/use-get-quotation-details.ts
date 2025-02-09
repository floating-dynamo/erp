import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useGetQuotationDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: ["quotations", id],
    queryFn: async () => {
      const quotation = await APIService.getQuotationById({ id });

      return quotation;
    },
    enabled: !!id,
  });

  return query;
};
