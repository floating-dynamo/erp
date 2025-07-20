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
import { Enquiry, EnquiryFile } from '@/features/enquiries/schemas';
import { GetCountriesResponse, GetMetadataResponse } from './types/index';
import {
  AddQuotationResponse,
  EditQuotationResponse,
  GetQuotationsResponse,
} from './types/quotation';
import { Quotation, QuotationFile } from '@/features/quotations/schemas';
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
import {
  AddBomResponse,
  EditBomResponse,
  GetBomsResponse,
} from './types/bom';
import { Bom } from '@/features/bom/schemas';

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
  BOMS = 'boms',
  COUNTRIES = 'countries',
  METADATA = 'metadata',
  USERS = 'users'
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

  // User Management Endpoints (Admin only)
  getUsers: (filters?: Record<string, string | number | boolean>) => Promise<import('./types/user').GetUsersResponse>;
  getUserById: ({ id }: { id: string }) => Promise<{ success: boolean; user?: import('./types/user').User }>;
  addUser: ({ user }: { user: import('@/features/users/schemas').AdminCreateUser }) => Promise<import('./types/user').AddUserResponse>;
  editUser: ({ id, data }: { id: string; data: import('@/features/users/schemas').AdminEditUser }) => Promise<import('./types/user').EditUserResponse>;
  deleteUser: ({ id }: { id: string }) => Promise<{ success: boolean; message: string }>;

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

  // Enquiry File Endpoints
  uploadEnquiryFiles: ({
    enquiryId,
    files,
  }: {
    enquiryId: string;
    files: FileList;
  }) => Promise<{ success: boolean; message: string }>;
  getEnquiryFiles: ({
    enquiryId,
  }: {
    enquiryId: string;
  }) => Promise<{ files: EnquiryFile[] }>;
  downloadEnquiryFile: ({
    enquiryId,
    fileId,
  }: {
    enquiryId: string;
    fileId: string;
  }) => Promise<Blob>;
  deleteEnquiryFile: ({
    enquiryId,
    fileId,
  }: {
    enquiryId: string;
    fileId: string;
  }) => Promise<{ success: boolean; message: string }>;

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

  // Quotation File Endpoints
  uploadQuotationFiles: ({
    quotationId,
    files,
  }: {
    quotationId: string;
    files: FileList;
  }) => Promise<{ success: boolean; message: string }>;
  getQuotationFiles: ({
    quotationId,
  }: {
    quotationId: string;
  }) => Promise<{ files: QuotationFile[] }>;
  downloadQuotationFile: ({
    quotationId,
    fileId,
  }: {
    quotationId: string;
    fileId: string;
  }) => Promise<Blob>;
  deleteQuotationFile: ({
    quotationId,
    fileId,
  }: {
    quotationId: string;
    fileId: string;
  }) => Promise<{ success: boolean; message: string }>;

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

  // BOM Endpoints
  getBoms: ({
    page,
    limit,
    searchQuery,
    productNameFilter,
    bomTypeFilter,
    statusFilter,
    costFrom,
    costTo,
  }: {
    page?: number;
    limit?: number;
    searchQuery?: string;
    productNameFilter?: string;
    bomTypeFilter?: string;
    statusFilter?: string;
    costFrom?: string;
    costTo?: string;
  }) => Promise<GetBomsResponse>;
  addBom: ({
    bom,
  }: {
    bom: Bom;
  }) => Promise<AddBomResponse>;
  getBomById: ({ id }: { id: string }) => Promise<Bom | null>;
  editBom: ({
    id,
    data,
  }: {
    id: string;
    data: Bom;
  }) => Promise<EditBomResponse>;
  updateBom: ({
    id,
    data,
  }: {
    id: string;
    data: Bom;
  }) => Promise<EditBomResponse>;
  
  // BOM Versioning Endpoints
  getBomVersions: ({ id }: { id: string }) => Promise<{ versions: Bom[]; total: number }>;
  getBomVersionHistory: ({ id }: { id: string }) => Promise<{ 
    versionHistory: Array<{
      versionNumber: string;
      bomId: string;
      createdAt: Date;
      createdBy: string;
      changeDescription?: string;
    }>;
    currentVersion: string;
    isLatestVersion: boolean;
  }>;
  getLatestBomByBaseId: ({ baseId }: { baseId: string }) => Promise<Bom>;

  // Metadata Endpoints
  getMetadata: ({
    type,
  }: {
    type?: MetaDataType;
  }) => Promise<GetMetadataResponse>;

  getCountries: () => Promise<GetCountriesResponse>;
}

export enum MetaDataType {
  UOM = 'uom',
  CURRENCY = 'currency',
}
