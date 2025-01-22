import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useGetCustomerDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: ["customerDetails"],
    queryFn: async () => {
      const customer = await APIService.getCustomerById({ id });

      return customer;
    },
    staleTime: 0,
    enabled: !!id,
  });

  return query;
};
