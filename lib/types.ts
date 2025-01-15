import { Customer } from "@/features/customers/schemas";
import { AddCustomerResponse, GetCusomtersResponse } from "./types/customer";
import { AddEnquiryResponse, GetEnquiriesResponse } from "./types/requirement";
import { Enquiry } from "@/features/enquiries/schemas";

export interface IApiService {
  // Customer Endpoints
  getCustomers: () => Promise<GetCusomtersResponse>;
  addCustomer: ({
    customer,
  }: {
    customer: Customer;
  }) => Promise<AddCustomerResponse>;

  // Enquiry Endpoints
  getEnquiries: () => Promise<GetEnquiriesResponse>;
  addEnquiry: ({
    enquiry,
  }: {
    enquiry: Enquiry;
  }) => Promise<AddEnquiryResponse>;
}
