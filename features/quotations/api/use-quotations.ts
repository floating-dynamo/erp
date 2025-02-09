import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useQuotations = () => {
  const query = useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const response = await APIService.getQuotations();

      if (!response) {
        return null;
      }

      const { quotations } = response;
      return quotations;
    },
  });

  return query;
};
