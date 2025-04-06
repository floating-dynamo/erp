import { Customer } from '@/features/customers/schemas';
import {
  AddCustomerResponse,
  EditCustomerResponse,
  GetCusomtersResponse,
} from './types/customer';
import {
  AddEnquiryResponse,
  EditEnquiryResponse,
  GetEnquiriesResponse,
} from './types/requirement';
import { Enquiry } from '@/features/enquiries/schemas';
import { GetCountriesResponse } from './types/index';
import { AddQuotationResponse, GetQuotationsResponse } from './types/quotation';
import { Quotation } from '@/features/quotations/schemas';

export interface IApiService {
  // Customer Endpoints
  getCustomers: (queryString: string) => Promise<GetCusomtersResponse>;
  addCustomer: ({
    customer,
  }: {
    customer: Customer;
  }) => Promise<AddCustomerResponse>;
  getCustomerById: ({ id }: { id: string }) => Promise<Customer | null>;
  editCustomer: ({
    id,
    data,
  }: {
    id: string;
    data: Customer;
  }) => Promise<EditCustomerResponse>;

  // Enquiry Endpoints
  getEnquiries: ({
    customerId,
  }: {
    customerId?: string;
  }) => Promise<GetEnquiriesResponse>;
  addEnquiry: ({
    enquiry,
  }: {
    enquiry: Enquiry;
  }) => Promise<AddEnquiryResponse>;
  getEnquiryById: ({ id }: { id: string }) => Promise<Enquiry | null>;
  editEnquiry: ({
    id,
    data,
  }: {
    id: string;
    data: Enquiry;
  }) => Promise<EditEnquiryResponse>;

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
  UOM = 'uom',
  CURRENCY = 'currency',
}
