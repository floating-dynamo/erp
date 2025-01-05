import { GetCusomtersResponse } from "./types/customer";

export interface IApiService {
  getCustomers: () => Promise<GetCusomtersResponse>;
}
