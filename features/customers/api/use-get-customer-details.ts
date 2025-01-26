import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useGetCustomerDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const customer = await APIService.getCustomerById({ id });

      return customer;
    },
  });

  return query;
};
