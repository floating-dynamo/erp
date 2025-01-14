import { Customer } from "@/features/customers/schemas";
import { AddCustomerResponse, GetCusomtersResponse } from "./types/customer";

export interface IApiService {
  getCustomers: () => Promise<GetCusomtersResponse>;
  addCustomer: ({
    customer,
  }: {
    customer: Customer;
  }) => Promise<AddCustomerResponse>;
}
