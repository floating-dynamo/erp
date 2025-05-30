import { Currency, UOM } from '@/features/metadata/schemas';

export interface GetMetadataResponse {
  uoms: UOM[];
  currencies: Currency[];
}

export interface GetCountriesResponse {
  error: boolean;
  msg: string;
  data: Array<{
    iso2: string;
    iso3: string;
    country: string;
    cities: string[];
  }>;
}
