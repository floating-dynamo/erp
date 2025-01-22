import APIService from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useCountries = () => {
  const query = useQuery({
    queryKey: ["countries"],
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
