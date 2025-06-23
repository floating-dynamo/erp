import { Customer, CustomerFile } from '@/features/customers/schemas';
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
import { GetCountriesResponse, GetMetadataResponse } from './types/index';
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
import {
  AddPurchaseOrderResponse,
  GetPurchaseOrdersResponse,
} from './types/purchase-order';
import { PurchaseOrder } from '@/features/purchase-orders/schemas';

export enum CurrencySymbol {
  INR = '₹',
  USD = '$',
  AED = 'د.إ',
  AUD = 'A$',
  CAD = 'C$',
  CHF = 'CHF',
  CNY_JPY = '¥',
  EUR = '€',
  GBP = '£',
  HKD = 'HK$',
  KRW = '₩',
  NZD = 'NZ$',
  SGD = 'S$',
}

export enum QueryKeyString {
  CUSTOMERS = 'customers',
  ENQUIRIES = 'enquiries',
  QUOTATIONS = 'quotations',
  COMPANIES = 'companies',
  SUPPLIER_DCS = 'supplier-dcs',
  PURCHASE_ORDERS = 'purchase-orders',
  COUNTRIES = 'countries',
  METADATA = 'metadata',
  USERS = 'users',
}

// Authentication response types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    privileges: string[];
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };
  token?: string;
}

export interface UserProfileResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    privileges: string[];
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };
}

// User Management Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  privileges: string[];
  isActive: boolean;
  lastLoginAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface IApiService {
  // Authentication Endpoints
  login: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<AuthResponse>;
  register: ({
    name,
    email,
    password,
    role,
    companyId,
  }: {
    name: string;
    email: string;
    password: string;
    role?: string;
    companyId: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<{ success: boolean }>;
  getCurrentUser: () => Promise<UserProfileResponse>;
  updateProfile: ({
    name,
    email,
  }: {
    name: string;
    email: string;
  }) => Promise<{ success: boolean; message: string }>;
  changePassword: ({
    currentPassword,
    newPassword,
    confirmPassword,
  }: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message: string }>;

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

  // Customer File Endpoints
  uploadCustomerFiles: ({
    customerId,
    files,
  }: {
    customerId: string;
    files: FileList;
  }) => Promise<{ success: boolean; message: string }>;
  getCustomerFiles: ({
    customerId,
  }: {
    customerId: string;
  }) => Promise<{ files: CustomerFile[] }>;
  downloadCustomerFile: ({
    customerId,
    fileId,
  }: {
    customerId: string;
    fileId: string;
  }) => Promise<Blob>;
  deleteCustomerFile: ({
    customerId,
    fileId,
  }: {
    customerId: string;
    fileId: string;
  }) => Promise<{ success: boolean; message: string }>;

  // Enquiry Endpoints
  getEnquiries: ({
    customerId,
    page,
    limit,
    searchQuery,
    customerFilter,
    dueDateFrom,
    dueDateTo,
    quotationCreated,
  }: {
    customerId?: string;
    page?: number;
    limit?: number;
    searchQuery?: string;
    customerFilter?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    quotationCreated?: string;
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
  getQuotations: ({
    page,
    limit,
    searchQuery,
    customerFilter,
    enquiryNumberFilter,
    amountFrom,
    amountTo,
  }: {
    page?: number;
    limit?: number;
    searchQuery?: string;
    customerFilter?: string;
    enquiryNumberFilter?: string;
    amountFrom?: string;
    amountTo?: string;
  }) => Promise<GetQuotationsResponse>;
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
    buyerNameFilter,
    enquiryId,
    deliveryDateFrom,
    deliveryDateTo,
    totalValueFrom,
    totalValueTo,
    page,
    limit,
    searchQuery,
  }: {
    customerId?: string;
    buyerNameFilter?: string;
    enquiryId?: string;
    deliveryDateFrom?: string;
    deliveryDateTo?: string;
    totalValueFrom?: string | number;
    totalValueTo?: string | number;
    page?: number;
    limit?: number;
    searchQuery?: string;
  }) => Promise<GetPurchaseOrdersResponse>;
  addPurchaseOrder: ({
    purchaseOrder,
  }: {
    purchaseOrder: PurchaseOrder;
  }) => Promise<AddPurchaseOrderResponse>;
  getPurchaseOrderDetails: ({ id }: { id: string }) => Promise<PurchaseOrder | null>;
  editPurchaseOrder: ({ id, data }: { id: string; data: PurchaseOrder }) => Promise<{ message: string; success: boolean }>;

  // Metadata Endpoints
  getMetadata: ({
    type,
  }: {
    type?: MetaDataType;
  }) => Promise<GetMetadataResponse>;

  getCountries: () => Promise<GetCountriesResponse>;

  // User Management Endpoints
  getUsers: (queryString: string) => Promise<GetUsersResponse>;
  addUser: ({
    user,
  }: {
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>;
  }) => Promise<{ success: boolean; message: string }>;
  getUserById: ({ id }: { id: string }) => Promise<User>;
  editUser: ({
    id,
    data,
  }: {
    id: string;
    data: Partial<User>;
  }) => Promise<{ success: boolean; message: string }>;
  deleteUser: ({ id }: { id: string }) => Promise<{ success: boolean; message: string }>;
}

export enum MetaDataType {
  UOM = 'uom',
  CURRENCY = 'currency',
}
