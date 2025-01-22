export interface CountryData {
  iso2: string;
  iso3: string;
  country: string;
  cities: string[];
}

export interface GetCountriesResponse {
  error: string;
  msg: string;
  data: CountryData[];
}
