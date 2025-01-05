import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useCustomers = () => {
  const query = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await APIService.getCustomers();

      if (!response) {
        return null;
      }

      const { customers } = response;
      return customers;
    },
  });

  return query;
};
