import { QueryKeyString } from "@/lib/types";
import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useCountries = () => {
  const query = useQuery({
    queryKey: [QueryKeyString.COUNTRIES],
    queryFn: async () => {
      const countries = await APIService.getCountries();

      if (!countries) {
        return null;
      }

      return countries;
    },
  });

  return query;
};
