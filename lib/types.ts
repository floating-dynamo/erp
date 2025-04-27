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
import {
  AddQuotationResponse,
  EditQuotationResponse,
  GetQuotationsResponse,
} from './types/quotation';
import { Quotation } from '@/features/quotations/schemas';
import { Company } from '@/features/companies/schemas';
import { GetCompaniesResponse } from './types/company';
import {
  AddSupplierDcResponse,
  EditSupplierDcResponse,
  GetSupplierDcsResponse,
} from './types/supplier-dc';
import { SupplierDc } from '@/features/supplier-dc/schemas';
import { GetPurchaseOrdersResponse } from './types/purchase-order';

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
  editQuotation: ({
    id,
    data,
  }: {
    id: string;
    data: Quotation;
  }) => Promise<EditQuotationResponse>;

  // Company Endpoints
  addCompany: ({
    company,
  }: {
    company: Company;
  }) => Promise<AddCustomerResponse>;
  getCompanies: () => Promise<GetCompaniesResponse>;

  // Supplier DC Endpoints
  getSupplierDcs: () => Promise<GetSupplierDcsResponse>;
  addSupplierDc: ({
    supplierDc,
  }: {
    supplierDc: SupplierDc;
  }) => Promise<AddSupplierDcResponse>;
  getSupplierDCById: ({ id }: { id: string }) => Promise<SupplierDc | null>;
  editSupplierDc: ({
    id,
    data,
  }: {
    id: string;
    data: SupplierDc;
  }) => Promise<EditSupplierDcResponse>;

  // Purchase Order Endpoints
  getPurchaseOrders: ({
    customerId,
  }: {
    customerId?: string;
  }) => Promise<GetPurchaseOrdersResponse>;

  getCountries: () => Promise<GetCountriesResponse>;
}

export enum MetaDataType {
  UOM = 'uom',
  CURRENCY = 'currency',
}
