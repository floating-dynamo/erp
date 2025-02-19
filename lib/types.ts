import { Customer } from "@/features/customers/schemas";
import { AddCustomerResponse, GetCusomtersResponse } from "./types/customer";
import { AddEnquiryResponse, GetEnquiriesResponse } from "./types/requirement";
import { Enquiry } from "@/features/enquiries/schemas";
import { GetCountriesResponse } from "./types/index";
import { AddQuotationResponse, GetQuotationsResponse } from "./types/quotation";
import { Quotation } from "@/features/quotations/schemas";

export interface IApiService {
  // Customer Endpoints
  getCustomers: () => Promise<GetCusomtersResponse>;
  addCustomer: ({
    customer,
  }: {
    customer: Customer;
  }) => Promise<AddCustomerResponse>;
  getCustomerById: ({ id }: { id: string }) => Promise<Customer | null>;

  // Enquiry Endpoints
  getEnquiries: () => Promise<GetEnquiriesResponse>;
  addEnquiry: ({
    enquiry,
  }: {
    enquiry: Enquiry;
  }) => Promise<AddEnquiryResponse>;
  getEnquiryById: ({ id }: { id: string }) => Promise<Enquiry | null>;

  // Quotation Endpoints
  getQuotations: () => Promise<GetQuotationsResponse>;
  addQuotation: ({
    quotation,
  }: {
    quotation: Quotation;
  }) => Promise<AddQuotationResponse>;
  getQuotationById: ({ id }: { id: string }) => Promise<Quotation | null>;

  getCountries: () => Promise<GetCountriesResponse>;
}

export enum MetaDataType {
  UOM = "uom",
  CURRENCY = "currency",
}
