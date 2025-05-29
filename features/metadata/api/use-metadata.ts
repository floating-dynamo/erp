import { useQuery } from '@tanstack/react-query';
import APIService from '@/services/api';
import { MetaDataType, QueryKeyString } from '@/lib/types';

/**
 * Hook to fetch metadata (UOMs, Currencies)
 * @param type Optional filter for specific metadata type
 * @returns Query object with metadata
 */
export const useMetadata = (type?: MetaDataType) => {
  return useQuery({
    queryKey: [QueryKeyString.METADATA, type],
    queryFn: async () => {
      const response = await APIService.getMetadata({ type });
      
      if (!response) {
        return { 
          uoms: [], 
          currencies: [] 
        };
      }
      
      return response;
    },
  });
};

/**
 * Specialized hook to fetch only UOMs
 * @returns Query object with UOMs data
 */
export const useUOMs = () => {
  const { data, ...rest } = useMetadata(MetaDataType.UOM);
  return { 
    uoms: data?.uoms || [], 
    ...rest 
  };
};

/**
 * Specialized hook to fetch only Currencies
 * @returns Query object with Currencies data
 */
export const useCurrencies = () => {
  const { data, ...rest } = useMetadata(MetaDataType.CURRENCY);
  return { 
    currencies: data?.currencies || [], 
    ...rest 
  };
};