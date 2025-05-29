import { Currency, UOM } from '@/features/metadata/schemas';

export interface GetMetadataResponse {
  uoms: UOM[];
  currencies: Currency[];
}

export interface GetCountriesResponse {
  countries: Array<{
    name: string;
    states: Array<{
      name: string;
      cities: string[];
    }>;
  }>;
}
