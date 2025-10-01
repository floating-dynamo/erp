// @ts-nocheck
import {
  IApiService,
  MetaDataType,
  AuthResponse,
  UserProfileResponse,
} from '@/lib/types';
import { User } from '@/lib/types/user';
import { ICustomer } from '@/lib/types/customer';
import { CUSTOMERS_MOCK_DATA } from './mocks/customers';
import { Customer, CustomerFile } from '@/features/customers/schemas';
import { Enquiry, EnquiryFile } from '@/features/enquiries/schemas';
import { ENQUIRIES_MOCK_DATA } from './mocks/enquiries';
import axios from 'axios';
import { Quotation, QuotationFile } from '@/features/quotations/schemas';
import QUOTATIONS_MOCK_DATA from './mocks/quotations';
import { COMPANIES_MOCK_DATA } from './mocks/companies';
import { Company } from '@/features/companies/schemas';
import { SupplierDc } from '@/features/supplier-dc/schemas';
import { SUPPLIER_DCS_MOCK_DATA } from './mocks/supplier-dcs';
import { PurchaseOrder } from '@/features/purchase-orders/schemas';
import { PURCHASE_ORDERS_MOCK_DATA } from './mocks/purchase-orders';
import {
  CURRENCIES_MOCK_DATA,
  UOMS_MOCK_DATA,
} from '@/features/metadata/model/mock-data';
import { Bom } from '@/features/bom/schemas';
import BOMS_MOCK_DATA from './mocks/boms';
import { USERS_MOCK_DATA } from './mocks/users';
import { WorkOrder } from '@/features/work-orders/schemas';
import { WORK_ORDERS_MOCK_DATA } from './mocks/work-orders';
import { Item, CreateItem, UpdateItem } from '@/features/items/schemas';
import { ITEMS_MOCK_DATA } from './mocks/items';
import Fuse from 'fuse.js';

// Initialize customers with attachments property to match Customer type
const customers: Customer[] = CUSTOMERS_MOCK_DATA.map((customer) => ({
  ...customer,
  attachments: (customer as Customer).attachments || [], // Use Customer type assertion instead of any
}));
const enquiries: Enquiry[] = ENQUIRIES_MOCK_DATA;

// Initialize quotations with attachments and load any persisted attachments from localStorage
const initializeQuotations = (): Quotation[] => {
  const baseQuotations = QUOTATIONS_MOCK_DATA.map((quotation) => ({
    ...quotation,
    attachments: quotation.attachments || [], // Ensure quotations have attachments array
  }));

  // Try to load persisted attachments from localStorage
  if (typeof window !== 'undefined') {
    try {
      const persistedAttachments = localStorage.getItem('quotation_attachments');
      if (persistedAttachments) {
        const attachmentsMap: Record<string, QuotationFile[]> = JSON.parse(persistedAttachments);
        baseQuotations.forEach((quotation) => {
          if (quotation.id && attachmentsMap[quotation.id]) {
            quotation.attachments = attachmentsMap[quotation.id].map((file: QuotationFile) => ({
              ...file,
              uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date(), // Convert back to Date object
            }));
          }
        });
      }
    } catch (error) {
      console.error('Error loading persisted quotation attachments:', error);
    }
  }

  return baseQuotations;
};

const quotations: Quotation[] = initializeQuotations();
const companies: Company[] = COMPANIES_MOCK_DATA;

// Helper function to persist quotation attachments to localStorage
const persistQuotationAttachments = () => {
  if (typeof window !== 'undefined') {
    try {
      const attachmentsMap: Record<string, QuotationFile[]> = {};
      quotations.forEach((quotation) => {
        if (quotation.id && quotation.attachments && quotation.attachments.length > 0) {
          attachmentsMap[quotation.id] = quotation.attachments;
        }
      });
      localStorage.setItem('quotation_attachments', JSON.stringify(attachmentsMap));
    } catch (error) {
      console.error('Error persisting quotation attachments:', error);
    }
  }
};
const supplierDcs: SupplierDc[] = SUPPLIER_DCS_MOCK_DATA;
const purchaseOrders: PurchaseOrder[] = PURCHASE_ORDERS_MOCK_DATA;
const boms: Bom[] = BOMS_MOCK_DATA;
const users: User[] = USERS_MOCK_DATA;
const workOrders: WorkOrder[] = WORK_ORDERS_MOCK_DATA;
const items: Item[] = ITEMS_MOCK_DATA;

// Fuse.js configuration for customer search
const customerSearchKeys = [
  'name',
  'address.city',
  'address.state',
  'gstNumber',
  'vendorId',
];

const customerFuseOptions = {
  keys: customerSearchKeys,
  threshold: 0.1, // Adjust threshold for fuzzy matching (0.0 = exact match, 1.0 = match anything)
  ignoreLocation: true, // Don't penalize matches that are far from the start
  includeScore: true, // Include match score in results
};

// Fuse.js configuration for quotation search
const quotationSearchKeys = [
  'customerName',
  'enquiryNumber',
  'quoteNumber',
  'totalAmount',
];

const quotationFuseOptions = {
  keys: quotationSearchKeys,
  threshold: 0.1,
  ignoreLocation: true,
  includeScore: true,
};

// Fuse.js configuration for user search
const userSearchKeys = [
  'name',
  'email',
  'role',
  'companyName',
];

const userFuseOptions = {
  keys: userSearchKeys,
  threshold: 0.1,
  ignoreLocation: true,
  includeScore: true,
};

// Mock authentication methods
const mockAuthService = {
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Only allow demo account when mock API is enabled
    if (email === 'test@example.com' && password === 'password123') {
      const user = {
        id: '1',
        name: 'John Doe',
        email: 'test@example.com',
        role: 'admin',
        companyId: '1',
        privileges: [
          'users.create',
          'users.read',
          'users.update',
          'users.delete',
          'customers.create',
          'customers.read',
          'customers.update',
          'customers.delete',
          'companies.create',
          'companies.read',
          'companies.update',
          'companies.delete',
          'enquiries.create',
          'enquiries.read',
          'enquiries.update',
          'enquiries.delete',
          'quotations.create',
          'quotations.read',
          'quotations.update',
          'quotations.delete',
          'purchase-orders.create',
          'purchase-orders.read',
          'purchase-orders.update',
          'purchase-orders.delete',
          'supplier-dcs.create',
          'supplier-dcs.read',
          'supplier-dcs.update',
          'supplier-dcs.delete',
          'settings.read',
          'settings.update',
          'reports.read',
          'export.pdf',
          'export.excel',
        ],
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };
      const token = 'mock-jwt-token-' + Date.now();
      return { success: true, message: 'Login successful', user, token };
    }

    throw new Error('Invalid email or password');
  },

  async register({
    name,
    email,
    password,
    role = 'employee',
    companyId,
  }: {
    name: string;
    email: string;
    password: string;
    role?: string;
    companyId: string;
  }): Promise<AuthResponse> {
    console.log(role, companyId);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Only allow demo registration when mock API is enabled
    if (email && password && name && companyId) {
      return {
        success: true,
        message: 'User registered successfully',
      };
    }

    throw new Error('Registration failed');
  },

  async logout(): Promise<{ success: boolean }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  },

  async getCurrentUser(): Promise<UserProfileResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return mock user data
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'test@example.com',
      role: 'admin',
      companyId: '1',
      privileges: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'customers.create',
        'customers.read',
        'customers.update',
        'customers.delete',
        'companies.create',
        'companies.read',
        'companies.update',
        'companies.delete',
        'enquiries.create',
        'enquiries.read',
        'enquiries.update',
        'enquiries.delete',
        'quotations.create',
        'quotations.read',
        'quotations.update',
        'quotations.delete',
        'purchase-orders.create',
        'purchase-orders.read',
        'purchase-orders.update',
        'purchase-orders.delete',
        'supplier-dcs.create',
        'supplier-dcs.read',
        'supplier-dcs.update',
        'supplier-dcs.delete',
        'settings.read',
        'settings.update',
        'reports.read',
        'export.pdf',
        'export.excel',
      ],
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };

    return {
      success: true,
      user,
    };
  },

  async updateProfile({
    name,
    email,
  }: {
    name: string;
    email: string;
  }): Promise<{ success: boolean; message: string }> {
    console.log(name, email);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  },

  async changePassword({
    currentPassword,
    newPassword,
    confirmPassword,
  }: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    console.log(currentPassword);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (newPassword !== confirmPassword) {
      throw new Error("Passwords don't match");
    }

    return {
      success: true,
      message: 'Password changed successfully',
    };
  },
};

const mockService: IApiService = {
  // Authentication Endpoints
  login: mockAuthService.login,
  register: mockAuthService.register,
  logout: mockAuthService.logout,
  getCurrentUser: mockAuthService.getCurrentUser,
  updateProfile: mockAuthService.updateProfile,
  changePassword: mockAuthService.changePassword,

  async getCustomers(queryString: string = '') {
    const params = new URLSearchParams(queryString);
    const country = params.get('country');
    const state = params.get('state');
    const city = params.get('city');
    const page = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '10', 10);
    const searchQuery = params.get('searchQuery') || '';
    const isSearching = searchQuery.trim().length > 0;

    // First apply location filters (country, state, city)
    const locationFilteredCustomers = customers?.filter((customer) => {
      if (!customer?.address) return false;
      const countryMatch = country
        ? customer?.address.country === country
        : true;
      const stateMatch = state ? customer?.address.state === state : true;
      const cityMatch = city ? customer?.address.city === city : true;
      return countryMatch && stateMatch && cityMatch;
    });

    let finalFilteredCustomers = locationFilteredCustomers;

    // Apply fuzzy search if search query exists
    if (isSearching) {
      const fuse = new Fuse(locationFilteredCustomers, customerFuseOptions);
      const searchResults = fuse.search(searchQuery);
      finalFilteredCustomers = searchResults.map((result) => result.item);
    }

    const totalCustomers = finalFilteredCustomers?.length || 0;

    // Apply pagination to the final filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = finalFilteredCustomers?.slice(
      startIndex,
      endIndex
    );

    const totalPages = Math.ceil(totalCustomers / limit);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          customers: paginatedCustomers,
          total: totalCustomers,
          page,
          limit,
          totalPages,
        });
      }, 1000);
    });
  },
  async addCustomer({ customer }) {
    // Generate an ID if not provided
    if (!customer.id) {
      customer.id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Ensure address.pincode is a number if provided, otherwise set to 0
    if (customer.address) {
      if (
        customer.address.pincode === undefined ||
        customer.address.pincode === null
      ) {
        customer.address.pincode = 0;
      }
    }

    // Create a properly typed customer object for the response
    const typedCustomer: ICustomer = {
      ...customer,
      address: customer.address
        ? {
            ...customer.address,
            address1: customer.address.address1 ?? '',
            address2: customer.address.address2 ?? '',
            city: customer.address.city ?? '',
            state: customer.address.state ?? '',
            country: customer.address.country ?? '',
            pincode: customer.address.pincode ?? 0, // Ensure pincode is always a number
          }
        : undefined,
      poc: customer.poc
        ? customer.poc.map(
            (poc: {
              name?: string;
              mobile?: string | number;
              email?: string;
            }) => ({
              name: poc.name ?? '',
              mobile:
                poc.mobile !== undefined && poc.mobile !== null
                  ? typeof poc.mobile === 'string'
                    ? Number(poc.mobile)
                    : poc.mobile
                  : undefined,
              email: poc.email ?? '', // Ensure email is always a string
            })
          )
        : undefined,
    };

    customers.push(customer);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Customer added successfully',
          success: true,
          customer: typedCustomer, // Return the properly typed customer
        });
      }, 1000);
    });
  },
  getCustomerById({ id }) {
    const customer = customers.find((customer) => customer.id === id) || null;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(customer);
      }, 1000);
    });
  },
  editCustomer({ id, data }) {
    const customer = customers.find((customer) => customer.id === id) || null;
    const updatedCustomer = { ...customer, ...data };
    const index = customers.findIndex((customer) => customer.id === id);
    if (index !== -1) {
      customers[index] = updatedCustomer;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Customer details edited',
          success: true,
        });
      }, 1000);
    });
  },
  async getEnquiries({
    customerId,
    page = 1,
    limit = 10,
    searchQuery = '',
    customerFilter = '',
    dueDateFrom = '',
    dueDateTo = '',
    quotationCreated = '',
  } = {}) {
    // Filter by customerId if provided
    let filteredEnquiries = customerId
      ? enquiries.filter((enquiry) => enquiry.customerId === customerId)
      : enquiries;

    // Apply additional filters
    if (customerFilter) {
      filteredEnquiries = filteredEnquiries.filter(
        (enquiry) =>
          enquiry.customerId === customerFilter ||
          enquiry.customerName
            .toLowerCase()
            .includes(customerFilter.toLowerCase())
      );
    }

    if (dueDateFrom) {
      const fromDate = new Date(dueDateFrom);
      filteredEnquiries = filteredEnquiries.filter(
        (enquiry) => new Date(enquiry.quotationDueDate) >= fromDate
      );
    }

    if (dueDateTo) {
      const toDate = new Date(dueDateTo);
      filteredEnquiries = filteredEnquiries.filter(
        (enquiry) => new Date(enquiry.quotationDueDate) <= toDate
      );
    }

    if (quotationCreated !== '') {
      const isCreated = quotationCreated === 'true';
      filteredEnquiries = filteredEnquiries.filter(
        (enquiry) => Boolean(enquiry.isQotationCreated) === isCreated
      );
    }

    const totalEnquiries = filteredEnquiries?.length || 0;

    // Check if there's a search query
    const isSearching = searchQuery.trim().length > 0;

    // If searching, return all records for client-side pagination
    // Otherwise, apply server-side pagination
    let paginatedEnquiries;
    if (isSearching) {
      paginatedEnquiries = filteredEnquiries;
    } else {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedEnquiries = filteredEnquiries?.slice(startIndex, endIndex);
    }

    const totalPages = Math.ceil(totalEnquiries / limit);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          enquiries: paginatedEnquiries,
          total: totalEnquiries,
          page,
          limit,
          totalPages,
        });
      }, 1000);
    });
  },
  addEnquiry({ enquiry }) {
    enquiries.push(enquiry);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Enquiry added successfully',
          success: true,
          enquiry: {
            id: enquiry.id || 'mock-id',
          },
        });
      }, 1000);
    });
  },
  getEnquiryById({ id }) {
    const enquiry = enquiries.find((enquiry) => enquiry?.id === id) || null;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(enquiry);
      }, 1000);
    });
  },
  editEnquiry({ id, data }) {
    const enquiry = enquiries.find((enquiry) => enquiry.id === id) || null;
    const updatedEnquiry = { ...enquiry, ...data };
    const index = enquiries.findIndex((enquiry) => enquiry.id === id);
    if (index !== -1) {
      enquiries[index] = updatedEnquiry;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Enquiry details edited',
          success: true,
        });
      }, 1000);
    });
  },

  // Enquiry File Management - using proper EnquiryFile types
  async getEnquiryFiles({
    enquiryId,
  }: {
    enquiryId: string;
  }): Promise<{ files: EnquiryFile[] }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    return {
      files: enquiry?.attachments || [],
    };
  },

  async uploadEnquiryFiles({
    enquiryId,
    files,
  }: {
    enquiryId: string;
    files: FileList;
  }): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (!enquiry) {
      return { success: false, message: 'Enquiry not found' };
    }

    // Initialize attachments if it doesn't exist
    if (!enquiry.attachments) {
      enquiry.attachments = [];
    }

    // Simulate file upload - create proper EnquiryFile objects
    Array.from(files).forEach((file) => {
      const enquiryFile: EnquiryFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        originalName: file.name,
        filename: `${Date.now()}_${file.name}`,
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };
      enquiry.attachments!.push(enquiryFile);
    });

    return { success: true, message: 'Files uploaded successfully' };
  },

  async downloadEnquiryFile({
    enquiryId,
    fileId,
  }: {
    enquiryId: string;
    fileId: string;
  }): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (!enquiry || !enquiry.attachments?.find((f) => f.id === fileId)) {
      throw new Error('File not found');
    }

    // Return a mock blob
    return new Blob(['Mock file content'], {
      type: 'application/octet-stream',
    });
  },

  async deleteEnquiryFile({
    enquiryId,
    fileId,
  }: {
    enquiryId: string;
    fileId: string;
  }): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (!enquiry) {
      return { success: false, message: 'Enquiry not found' };
    }

    if (!enquiry.attachments) {
      return { success: false, message: 'File not found' };
    }

    const initialLength = enquiry.attachments.length;
    enquiry.attachments = enquiry.attachments.filter(
      (file) => file.id !== fileId
    );

    if (enquiry.attachments.length === initialLength) {
      return { success: false, message: 'File not found' };
    }

    return { success: true, message: 'File deleted successfully' };
  },
  async getCountries() {
    try {
      const countries = await axios.get('/api/countries');
      return countries.data;
    } catch (error) {
      console.error(error);
    }
  },
  async getQuotations({
    page = 1,
    limit = 10,
    searchQuery = '',
    customerFilter = '',
    enquiryNumberFilter = '',
    amountFrom = '',
    amountTo = '',
  } = {}) {
    // Check if there's a search query
    const isSearching = searchQuery?.trim().length > 0;

    // Filter quotations based on search query if provided
    let filteredQuotations = [...quotations];

    // Apply customer filter
    if (customerFilter) {
      filteredQuotations = filteredQuotations.filter(
        (quotation) => quotation.customerId === customerFilter
      );
    }

    // Apply enquiry number filter
    if (enquiryNumberFilter) {
      filteredQuotations = filteredQuotations.filter(
        (quotation) => quotation.enquiryNumber === enquiryNumberFilter
      );
    }

    // Apply amount range filters
    if (amountFrom) {
      const minAmount = parseFloat(amountFrom);
      filteredQuotations = filteredQuotations.filter(
        (quotation) => quotation.totalAmount || 0 >= minAmount
      );
    }

    if (amountTo) {
      const maxAmount = parseFloat(amountTo);
      filteredQuotations = filteredQuotations.filter(
        (quotation) => quotation?.totalAmount || 0 <= maxAmount
      );
    }

    // After applying filters, use search query if present
    if (isSearching) {
      const fuse = new Fuse(filteredQuotations, quotationFuseOptions);
      const searchResults = fuse.search(searchQuery);
      filteredQuotations = searchResults.map((result) => result.item);
    }

    const totalQuotations = filteredQuotations.length;

    // Apply pagination
    let paginatedQuotations;
    if (isSearching) {
      // Return all filtered results for client-side pagination when searching
      paginatedQuotations = filteredQuotations;
    } else {
      // Apply server-side pagination when not searching
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedQuotations = filteredQuotations.slice(startIndex, endIndex);
    }

    const totalPages = Math.ceil(totalQuotations / limit);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          quotations: paginatedQuotations,
          total: totalQuotations,
          page,
          limit,
          totalPages,
        });
      }, 1000);
    });
  },
  async getQuotationById({ id }) {
    const quotation =
      quotations.find((quotation) => quotation?.id === id) || null;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(quotation);
      }, 1000);
    });
  },
  async addQuotation({ quotation }) {
    // Generate an ID if not provided
    if (!quotation.id) {
      quotation.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    quotations.push(quotation);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Quotation added successfully',
          success: true,
          quoteNumber: quotation.quoteNumber || '',
          quotation: quotation, // Return the quotation with ID for file upload
        });
      }, 1000);
    });
  },
  async editQuotation({ id, data }) {
    const quotation =
      quotations.find((quotation) => quotation.id === id) || null;
    const updatedQuotation = { ...quotation, ...data };
    const index = quotations.findIndex((quotation) => quotation.id === id);
    if (index !== -1) {
      quotations[index] = updatedQuotation;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Quotations details edited',
          success: true,
        });
      }, 1000);
    });
  },

  // Quotation File Management
  async getQuotationFiles({
    quotationId,
  }: {
    quotationId: string;
  }): Promise<{ files: QuotationFile[] }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const quotation = quotations.find((q) => q.id === quotationId);
    return {
      files: quotation?.attachments || [],
    };
  },

  async uploadQuotationFiles({
    quotationId,
    files,
  }: {
    quotationId: string;
    files: FileList;
  }): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) {
      return { success: false, message: 'Quotation not found' };
    }

    // Initialize attachments if it doesn't exist
    if (!quotation.attachments) {
      quotation.attachments = [];
    }

    // Simulate file upload - create proper QuotationFile objects
    Array.from(files).forEach((file) => {
      const quotationFile: QuotationFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        originalName: file.name,
        filename: `${Date.now()}_${file.name}`,
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };
      quotation.attachments!.push(quotationFile);
    });

    // Persist attachments to localStorage
    persistQuotationAttachments();

    return { success: true, message: 'Files uploaded successfully' };
  },

  async downloadQuotationFile({
    quotationId,
    fileId,
  }: {
    quotationId: string;
    fileId: string;
  }): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation || !quotation.attachments?.find((f) => f.id === fileId)) {
      throw new Error('File not found');
    }

    // Return a mock blob
    return new Blob(['Mock file content'], {
      type: 'application/octet-stream',
    });
  },

  async deleteQuotationFile({
    quotationId,
    fileId,
  }: {
    quotationId: string;
    fileId: string;
  }): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) {
      return { success: false, message: 'Quotation not found' };
    }

    if (quotation.attachments) {
      quotation.attachments = quotation.attachments.filter((file) => file.id !== fileId);
    }

    // Persist attachments to localStorage
    persistQuotationAttachments();

    return { success: true, message: 'File deleted successfully' };
  },

  async getCompanies() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          companies,
        });
      }, 1000);
    });
  },
  async addCompany({ company }) {
    companies.push(company);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Company added successfully',
          success: true,
        });
      }, 1000);
    });
  },
  async getSupplierDcs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          supplierDcs,
        });
      }, 1000);
    });
  },
  async addSupplierDc({ supplierDc }) {
    supplierDcs.push(supplierDc);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Supplier DC added successfully',
          success: true,
        });
      }, 1000);
    });
  },
  async getSupplierDCById({ id }) {
    const supplierDc =
      supplierDcs.find((supplierDc) => supplierDc.id === id) || null;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(supplierDc);
      }, 1000);
    });
  },
  async editSupplierDc({ id, data }) {
    const supplierDc =
      supplierDcs.find((supplierDc) => supplierDc.id === id) || null;
    const updatedSupplierDc = { ...supplierDc, ...data };
    const index = supplierDcs.findIndex((supplierDc) => supplierDc.id === id);
    if (index !== -1) {
      supplierDcs[index] = updatedSupplierDc;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Supplier DC details edited',
          success: true,
        });
      }, 1000);
    });
  },
  async getPurchaseOrders({
    customerId,
    buyerNameFilter,
    enquiryId,
    deliveryDateFrom,
    deliveryDateTo,
    totalValueFrom,
    totalValueTo,
    page = 1,
    limit = 10,
    searchQuery = '',
  } = {}) {
    // Filter purchase orders based on criteria
    let filteredPurchaseOrders = [...purchaseOrders];

    // Apply customer filter
    if (customerId) {
      filteredPurchaseOrders = filteredPurchaseOrders.filter(
        (po) => po.customerId === customerId
      );
    }

    // Apply buyer name filter
    if (buyerNameFilter) {
      filteredPurchaseOrders = filteredPurchaseOrders.filter((po) =>
        po.buyerName?.toLowerCase().includes(buyerNameFilter.toLowerCase())
      );
    }

    // Apply enquiry id filter
    if (enquiryId) {
      filteredPurchaseOrders = filteredPurchaseOrders.filter(
        (po) => po.enquiryId === enquiryId
      );
    }

    // Apply delivery date range filters with type safety checks
    if (deliveryDateFrom) {
      const fromDate = new Date(deliveryDateFrom);
      filteredPurchaseOrders = filteredPurchaseOrders.filter((po) =>
        po.deliveryDate ? new Date(po.deliveryDate) >= fromDate : false
      );
    }

    if (deliveryDateTo) {
      const toDate = new Date(deliveryDateTo);
      filteredPurchaseOrders = filteredPurchaseOrders.filter((po) =>
        po.deliveryDate ? new Date(po.deliveryDate) <= toDate : false
      );
    }

    // Apply total value range filters with type safety checks
    if (totalValueFrom) {
      const minValue = parseFloat(String(totalValueFrom));
      filteredPurchaseOrders = filteredPurchaseOrders.filter((po) =>
        typeof po.totalValue === 'number' ? po.totalValue >= minValue : false
      );
    }

    if (totalValueTo) {
      const maxValue = parseFloat(String(totalValueTo));
      filteredPurchaseOrders = filteredPurchaseOrders.filter((po) =>
        typeof po.totalValue === 'number' ? po.totalValue <= maxValue : false
      );
    }

    const totalPurchaseOrders = filteredPurchaseOrders.length;

    // Check if there's a search query
    const isSearching = searchQuery?.trim().length > 0;

    // If searching, we'll need to implement fuzzy search
    if (isSearching) {
      const fuseSearchKeys = [
        'poNumber',
        'buyerName',
        'customerName',
        'totalBasicValue',
        'totalValue',
      ];

      const fuse = new Fuse(filteredPurchaseOrders, {
        keys: fuseSearchKeys,
        threshold: 0.1,
        ignoreLocation: true,
      });

      const searchResults = fuse.search(searchQuery);
      filteredPurchaseOrders = searchResults.map((result) => result.item);
    }

    // Apply pagination
    let paginatedPurchaseOrders;
    if (isSearching) {
      // Return all filtered results for client-side pagination when searching
      paginatedPurchaseOrders = filteredPurchaseOrders;
    } else {
      // Apply server-side pagination when not searching
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedPurchaseOrders = filteredPurchaseOrders.slice(
        startIndex,
        endIndex
      );
    }

    const totalPages = Math.ceil(totalPurchaseOrders / limit);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          purchaseOrders: paginatedPurchaseOrders,
          total: totalPurchaseOrders,
          totalPages,
        });
      }, 1000);
    });
  },
  async addPurchaseOrder({ purchaseOrder }) {
    purchaseOrders.push(purchaseOrder);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Purchase Order added successfully',
          success: true,
        });
      }, 1000);
    });
  },
  async editPurchaseOrder({ id, data }) {
    const purchaseOrder = purchaseOrders.find((po) => po.id === id) || null;
    const updatedPurchaseOrder = { ...purchaseOrder, ...data };
    const index = purchaseOrders.findIndex((po) => po.id === id);
    if (index !== -1) {
      purchaseOrders[index] = updatedPurchaseOrder;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Purchase Order updated successfully',
          success: true,
        });
      }, 1000);
    });
  },
  async getPurchaseOrderDetails({ id }) {
    const purchaseOrder = purchaseOrders.find((po) => po.id === id) || null;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(purchaseOrder);
      }, 1000);
    });
  },
  async getMetadata({ type } = {}) {
    // Initialize response with proper types for the arrays
    const response = {
      currencies: [] as typeof CURRENCIES_MOCK_DATA,
      uoms: [] as typeof UOMS_MOCK_DATA,
    };

    // If type is UOM or not specified, return UOMs
    if (!type || type === MetaDataType.UOM) {
      response.uoms = UOMS_MOCK_DATA;
    }

    // If type is CURRENCY or not specified, return Currencies
    if (!type || type === MetaDataType.CURRENCY) {
      response.currencies = CURRENCIES_MOCK_DATA;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, 1000);
    });
  },

  // Customer File Management - using proper CustomerFile types
  async getCustomerFiles({
    customerId,
  }: {
    customerId: string;
  }): Promise<{ files: CustomerFile[] }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const customer = customers.find((c) => c.id === customerId);
    return {
      files: customer?.attachments || [],
    };
  },

  async uploadCustomerFiles({
    customerId,
    files,
  }: {
    customerId: string;
    files: FileList;
  }): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found' };
    }

    // Initialize attachments if it doesn't exist
    if (!customer.attachments) {
      customer.attachments = [];
    }

    // Simulate file upload - create proper CustomerFile objects
    Array.from(files).forEach((file) => {
      const customerFile: CustomerFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        originalName: file.name,
        filename: `${Date.now()}_${file.name}`,
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };
      customer.attachments!.push(customerFile);
    });

    return { success: true, message: 'Files uploaded successfully' };
  },

  async downloadCustomerFile({
    customerId,
    fileId,
  }: {
    customerId: string;
    fileId: string;
  }): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || !customer.attachments?.find((f) => f.id === fileId)) {
      throw new Error('File not found');
    }

    // Return a mock blob
    return new Blob(['Mock file content'], {
      type: 'application/octet-stream',
    });
  },

  async deleteCustomerFile({
    customerId,
    fileId,
  }: {
    customerId: string;
    fileId: string;
  }): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found' };
    }

    if (!customer.attachments) {
      return { success: false, message: 'File not found' };
    }

    const initialLength = customer.attachments.length;
    customer.attachments = customer.attachments.filter(
      (file) => file.id !== fileId
    );

    if (customer.attachments.length === initialLength) {
      return { success: false, message: 'File not found' };
    }

    return { success: true, message: 'File deleted successfully' };
  },

  // BOM Endpoints
  async getBoms({
    page = 1,
    limit = 10,
    searchQuery = '',
    productNameFilter = '',
    bomTypeFilter = '',
    statusFilter = '',
    costFrom = '',
    costTo = '',
  } = {}) {
    // Check if there's a search query
    const isSearching = searchQuery?.trim().length > 0;

    // Filter BOMs based on criteria
    let filteredBoms = [...boms];

    // Apply product name filter
    if (productNameFilter) {
      filteredBoms = filteredBoms.filter((bom) =>
        bom.productName.toLowerCase().includes(productNameFilter.toLowerCase())
      );
    }

    // Apply BOM type filter
    if (bomTypeFilter) {
      filteredBoms = filteredBoms.filter(
        (bom) => bom.bomType === bomTypeFilter
      );
    }

    // Apply status filter
    if (statusFilter) {
      filteredBoms = filteredBoms.filter(
        (bom) => bom.status === statusFilter
      );
    }

    // Apply cost range filters
    if (costFrom) {
      const minCost = parseFloat(costFrom);
      filteredBoms = filteredBoms.filter(
        (bom) => (bom.totalMaterialCost || 0) >= minCost
      );
    }

    if (costTo) {
      const maxCost = parseFloat(costTo);
      filteredBoms = filteredBoms.filter(
        (bom) => (bom.totalMaterialCost || 0) <= maxCost
      );
    }

    // After applying filters, use search query if present
    if (isSearching) {
      const bomSearchKeys = [
        'bomName',
        'productName',
        'productCode',
        'bomNumber',
        'bomType',
        'status',
      ];

      const fuse = new Fuse(filteredBoms, {
        keys: bomSearchKeys,
        threshold: 0.1,
        ignoreLocation: true,
      });

      const searchResults = fuse.search(searchQuery);
      filteredBoms = searchResults.map((result) => result.item);
    }

    const totalBoms = filteredBoms.length;

    // Apply pagination
    let paginatedBoms;
    if (isSearching) {
      // Return all filtered results for client-side pagination when searching
      paginatedBoms = filteredBoms;
    } else {
      // Apply server-side pagination when not searching
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedBoms = filteredBoms.slice(startIndex, endIndex);
    }

    const totalPages = Math.ceil(totalBoms / limit);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          boms: paginatedBoms,
          total: totalBoms,
          page,
          limit,
          totalPages,
        });
      }, 1000);
    });
  },

  async getBomById({ id }) {
    const bom = boms.find((bom) => bom?.id === id) || null;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(bom);
      }, 1000);
    });
  },

  async addBom({ bom }) {
    boms.push(bom);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'BOM added successfully',
          success: true,
          bomNumber: bom.bomNumber || '',
        });
      }, 1000);
    });
  },

  async editBom({ id, data }) {
    const bom = boms.find((bom) => bom.id === id) || null;
    const updatedBom = { ...bom, ...data };
    const index = boms.findIndex((bom) => bom.id === id);
    if (index !== -1) {
      boms[index] = updatedBom;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'BOM details edited',
          success: true,
        });
      }, 1000);
    });
  },

  // User Management Endpoints
  async getUsers(filters: Record<string, string | number | boolean> = {}) {
    const {
      role,
      isActive,
      companyId,
      page = 1,
      limit = 10,
      searchQuery = '',
      lastLoginFrom,
      lastLoginTo,
      createdFrom,
      createdTo,
    } = filters;

    // Filter users based on criteria
    let filteredUsers = [...users];

    // Apply role filter
    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    // Apply active status filter
    if (isActive !== undefined && isActive !== '') {
      const activeStatus = isActive === 'true' || isActive === true;
      filteredUsers = filteredUsers.filter((user) => user.isActive === activeStatus);
    }

    // Apply company filter
    if (companyId) {
      filteredUsers = filteredUsers.filter((user) => user.companyId === companyId);
    }

    // Apply last login date range filters
    if (lastLoginFrom) {
      const fromDate = new Date(lastLoginFrom as string);
      filteredUsers = filteredUsers.filter((user) =>
        user.lastLoginAt ? new Date(user.lastLoginAt) >= fromDate : false
      );
    }

    if (lastLoginTo) {
      const toDate = new Date(lastLoginTo as string);
      filteredUsers = filteredUsers.filter((user) =>
        user.lastLoginAt ? new Date(user.lastLoginAt) <= toDate : false
      );
    }

    // Apply created date range filters
    if (createdFrom) {
      const fromDate = new Date(createdFrom as string);
      filteredUsers = filteredUsers.filter((user) =>
        new Date(user.createdAt) >= fromDate
      );
    }

    if (createdTo) {
      const toDate = new Date(createdTo as string);
      filteredUsers = filteredUsers.filter((user) =>
        new Date(user.createdAt) <= toDate
      );
    }

    // Apply search query if present
    const isSearching = (searchQuery as string).trim().length > 0;
    if (isSearching) {
      const fuse = new Fuse(filteredUsers, userFuseOptions);
      const searchResults = fuse.search(searchQuery as string);
      filteredUsers = searchResults.map((result) => result.item);
    }

    const totalUsers = filteredUsers.length;

    // Apply pagination
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : (page as number);
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : (limit as number);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const totalPages = Math.ceil(totalUsers / limitNum);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          users: paginatedUsers,
          total: totalUsers,
          page: pageNum,
          limit: limitNum,
          totalPages,
        });
      }, 1000);
    });
  },

  async getUserById({ id }: { id: string }) {
    const user = users.find((user) => user.id === id) || null;
    return new Promise((resolve) => {
      setTimeout(() => {
        if (user) {
          resolve({
            success: true,
            user,
          });
        } else {
          resolve({
            success: false,
          });
        }
      }, 500);
    });
  },

  async addUser({ user }: { user: { name: string; email: string; password: string; role: string; companyId: string; isActive: boolean } }) {
    // Generate a new ID
    const newId = (users.length + 1).toString();
    
    // Find company name
    const company = companies.find((c) => c.id === user.companyId);
    const companyName = company ? company.name : '';

    // Generate default privileges based on role
    const getPrivilegesByRole = (role: string): string[] => {
      switch (role) {
        case 'admin':
          return [
            'users.create', 'users.read', 'users.update', 'users.delete',
            'customers.create', 'customers.read', 'customers.update', 'customers.delete',
            'companies.create', 'companies.read', 'companies.update', 'companies.delete',
            'enquiries.create', 'enquiries.read', 'enquiries.update', 'enquiries.delete',
            'quotations.create', 'quotations.read', 'quotations.update', 'quotations.delete',
            'purchase-orders.create', 'purchase-orders.read', 'purchase-orders.update', 'purchase-orders.delete',
            'supplier-dcs.create', 'supplier-dcs.read', 'supplier-dcs.update', 'supplier-dcs.delete',
            'settings.read', 'settings.update', 'reports.read', 'export.pdf', 'export.excel',
          ];
        case 'manager':
          return [
            'customers.create', 'customers.read', 'customers.update',
            'enquiries.create', 'enquiries.read', 'enquiries.update',
            'quotations.create', 'quotations.read', 'quotations.update',
            'reports.read',
          ];
        case 'sales':
          return [
            'customers.create', 'customers.read', 'customers.update',
            'enquiries.create', 'enquiries.read', 'enquiries.update',
            'quotations.create', 'quotations.read', 'quotations.update',
          ];
        case 'purchase':
          return [
            'purchase-orders.create', 'purchase-orders.read', 'purchase-orders.update',
            'supplier-dcs.create', 'supplier-dcs.read', 'supplier-dcs.update',
          ];
        default:
          return ['customers.read', 'enquiries.read', 'quotations.read'];
      }
    };

    const newUser: User = {
      id: newId,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'manager' | 'employee' | 'viewer' | 'accountant' | 'sales' | 'purchase',
      privileges: getPrivilegesByRole(user.role),
      isActive: user.isActive,
      companyId: user.companyId,
      companyName,
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'User created successfully',
          user: newUser,
        });
      }, 1000);
    });
  },

  async editUser({ id, data }: { id: string; data: Partial<User> }) {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: false,
            message: 'User not found',
          });
        }, 500);
      });
    }

    // Find company name if companyId is being updated
    let companyName = users[userIndex].companyName;
    if (data.companyId) {
      const company = companies.find((c) => c.id === data.companyId);
      companyName = company ? company.name : '';
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...data,
      companyName,
      updatedAt: new Date(),
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'User updated successfully',
        });
      }, 1000);
    });
  },

  async deleteUser({ id }: { id: string }) {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: false,
            message: 'User not found',
          });
        }, 500);
      });
    }

    // Soft delete by deactivating the user
    users[userIndex] = {
      ...users[userIndex],
      isActive: false,
      updatedAt: new Date(),
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'User deactivated successfully',
        });
      }, 1000);
    });
  },

  // Work Orders
  async getWorkOrders({
    page = 1,
    limit = 10,
    searchQuery = '',
    statusFilter = '',
    orderTypeFilter = '',
    customerId = '',
    startDate = '',
    endDate = '',
  } = {}) {
    // Check if there's a search query
    const isSearching = searchQuery?.trim().length > 0;

    // Filter work orders based on criteria
    let filteredWorkOrders = [...workOrders];

    // Apply status filter
    if (statusFilter) {
      filteredWorkOrders = filteredWorkOrders.filter(
        (workOrder) => workOrder.status === statusFilter
      );
    }

    // Apply order type filter
    if (orderTypeFilter) {
      filteredWorkOrders = filteredWorkOrders.filter(
        (workOrder) => workOrder.orderType === orderTypeFilter
      );
    }

    // Apply customer ID filter
    if (customerId) {
      filteredWorkOrders = filteredWorkOrders.filter(
        (workOrder) => workOrder.customerId === customerId
      );
    }

    // Apply date range filters
    if (startDate || endDate) {
      filteredWorkOrders = filteredWorkOrders.filter((workOrder) => {
        const targetDateObj = new Date(workOrder.targetDate);
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;

        if (startDateObj && targetDateObj < startDateObj) return false;
        if (endDateObj && targetDateObj > endDateObj) return false;
        return true;
      });
    }

    // Apply fuzzy search if search query exists
    if (isSearching) {
      const searchKeys = [
        'workOrderNumber',
        'workOrderName',
        'customerName',
        'productName',
        'productCode',
      ];
      const fuseOptions = {
        keys: searchKeys,
        threshold: 0.1,
        ignoreLocation: true,
        includeScore: true,
      };
      const fuse = new Fuse(filteredWorkOrders, fuseOptions);
      const searchResults = fuse.search(searchQuery);
      filteredWorkOrders = searchResults.map((result) => result.item);
    }

    const totalWorkOrders = filteredWorkOrders.length;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWorkOrders = filteredWorkOrders.slice(startIndex, endIndex);

    const totalPages = Math.ceil(totalWorkOrders / limit);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          workOrders: paginatedWorkOrders,
          total: totalWorkOrders,
          page,
          limit,
          totalPages,
        });
      }, 1000);
    });
  },

  async addWorkOrder({ workOrder }) {
    // Generate work order number if not provided
    const workOrderNumber = workOrder.workOrderNumber || 
      `WO/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${String(workOrders.length + 1).padStart(5, '0')}`;
    
    const newWorkOrder: WorkOrder = {
      ...workOrder,
      id: workOrder.id || `wo${Date.now()}`,
      workOrderNumber,
    };

    workOrders.unshift(newWorkOrder);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Work order added successfully',
          workOrderNumber,
        });
      }, 1000);
    });
  },

  async getWorkOrderById({ id }) {
    const workOrder = workOrders.find((wo) => wo.id === id);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (workOrder) {
          resolve(workOrder);
        } else {
          reject(new Error('Work order not found'));
        }
      }, 1000);
    });
  },

  async editWorkOrder({ id, data }) {
    const index = workOrders.findIndex((wo) => wo.id === id);

    if (index === -1) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Work order not found'));
        }, 1000);
      });
    }

    workOrders[index] = {
      ...workOrders[index],
      ...data,
      id,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Work order updated successfully',
        });
      }, 1000);
    });
  },

  async deleteWorkOrder({ id }) {
    const index = workOrders.findIndex((wo) => wo.id === id);

    if (index === -1) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Work order not found'));
        }, 1000);
      });
    }

    workOrders.splice(index, 1);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Work order deleted successfully',
        });
      }, 1000);
    });
  },

  async updateWorkOrderStatus({ id, status, actualStartDate, actualEndDate }) {
    const index = workOrders.findIndex((wo) => wo.id === id);

    if (index === -1) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Work order not found'));
        }, 1000);
      });
    }

    const updates: Partial<WorkOrder> = { 
      status: status as WorkOrder['status']
    };
    if (actualStartDate) updates.actualStartDate = actualStartDate;
    if (actualEndDate) updates.actualEndDate = actualEndDate;

    workOrders[index] = {
      ...workOrders[index],
      ...updates,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Work order status updated successfully',
        });
      }, 1000);
    });
  },

  async updateWorkOrderOperation({ workOrderId, operationSequence, ...operationData }) {
    const workOrderIndex = workOrders.findIndex((wo) => wo.id === workOrderId);

    if (workOrderIndex === -1) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Work order not found'));
        }, 1000);
      });
    }

    const operationIndex = workOrders[workOrderIndex].operations?.findIndex(
      (op) => op.operationSequence === operationSequence
    );

    if (operationIndex === -1 || operationIndex === undefined) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Operation not found'));
        }, 1000);
      });
    }

    if (workOrders[workOrderIndex].operations) {
      workOrders[workOrderIndex].operations[operationIndex] = {
        ...workOrders[workOrderIndex].operations[operationIndex],
        ...operationData,
      };
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Work order operation updated successfully',
        });
      }, 1000);
    });
  },

  async updateWorkOrderResourceConsumption({ workOrderId, resourceIndex, ...resourceData }) {
    const workOrderIndex = workOrders.findIndex((wo) => wo.id === workOrderId);

    if (workOrderIndex === -1) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Work order not found'));
        }, 1000);
      });
    }

    if (!workOrders[workOrderIndex].resources || 
        resourceIndex < 0 || 
        resourceIndex >= workOrders[workOrderIndex].resources!.length) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Resource not found'));
        }, 1000);
      });
    }

    workOrders[workOrderIndex].resources![resourceIndex] = {
      ...workOrders[workOrderIndex].resources![resourceIndex],
      ...resourceData,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Work order resource consumption updated successfully',
        });
      }, 1000);
    });
  },

  async getWorkOrderStats() {
    const totalWorkOrders = workOrders.length;
    const plannedWorkOrders = workOrders.filter(wo => wo.status === 'PLANNED').length;
    const inProgressWorkOrders = workOrders.filter(wo => wo.status === 'STARTED').length;
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'COMPLETED').length;
    const overdueWorkOrders = workOrders.filter(wo => 
      wo.dueDate && new Date(wo.dueDate) < new Date() && wo.status !== 'COMPLETED'
    ).length;
    
    const totalPlannedCost = workOrders.reduce((sum, wo) => sum + (wo.plannedCost || 0), 0);
    const totalActualCost = workOrders.reduce((sum, wo) => sum + (wo.actualCost || 0), 0);
    
    const completedWorkOrdersWithDates = workOrders.filter(wo => 
      wo.status === 'COMPLETED' && wo.actualStartDate && wo.actualEndDate
    );
    
    const averageCompletionTime = completedWorkOrdersWithDates.length > 0 
      ? completedWorkOrdersWithDates.reduce((sum, wo) => {
          const start = new Date(wo.actualStartDate!);
          const end = new Date(wo.actualEndDate!);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
        }, 0) / completedWorkOrdersWithDates.length
      : 0;
    
    const efficiencyPercentage = totalPlannedCost > 0 
      ? Math.min(100, (totalPlannedCost / Math.max(totalActualCost, 1)) * 100)
      : 100;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalWorkOrders,
          plannedWorkOrders,
          inProgressWorkOrders,
          completedWorkOrders,
          overdueWorkOrders,
          totalPlannedCost,
          totalActualCost,
          averageCompletionTime,
          efficiencyPercentage,
        });
      }, 1000);
    });
  },

  // Items API methods
  async getItems(
    searchQuery?: string,
    page?: number,
    limit?: number,
    isActiveFilter?: boolean,
    categoryFilter?: string
  ) {
    // Set defaults
    const currentPage = page || 1;
    const currentLimit = limit || 10;
    
    // Check if there's a search query
    const isSearching = searchQuery && searchQuery.trim().length > 0;

    // Filter items based on criteria
    let filteredItems = [...items];

    // Apply active filter
    if (isActiveFilter !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.isActive === isActiveFilter
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filteredItems = filteredItems.filter(
        (item) => item.category === categoryFilter
      );
    }

    // Apply search if provided
    if (isSearching && searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.itemCode?.toLowerCase().includes(searchLower) ||
          item.itemDescription?.toLowerCase().includes(searchLower) ||
          item.category?.toLowerCase().includes(searchLower) ||
          item.manufacturer?.toLowerCase().includes(searchLower) ||
          item.partNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = startIndex + currentLimit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: paginatedItems,
          total: filteredItems.length,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(filteredItems.length / currentLimit),
        });
      }, 500);
    });
  },

  async getItem(id: string) {
    const item = items.find((item) => item.id === id);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (item) {
          resolve(item);
        } else {
          reject(new Error('Item not found'));
        }
      }, 300);
    });
  },

  async createItem(data: CreateItem) {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    items.push(newItem);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Item created successfully',
          data: newItem,
        });
      }, 800);
    });
  },

  async updateItem(id: string, data: UpdateItem) {
    const index = items.findIndex((item) => item.id === id);
    
    if (index === -1) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Item not found'));
        }, 300);
      });
    }

    const updatedItem = {
      ...items[index],
      ...data,
      updatedAt: new Date(),
    };

    items[index] = updatedItem;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Item updated successfully',
          data: updatedItem,
        });
      }, 800);
    });
  },

  async deleteItem(id: string) {
    const index = items.findIndex((item) => item.id === id);
    
    if (index === -1) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Item not found'));
        }, 300);
      });
    }

    // Soft delete - mark as inactive
    items[index].isActive = false;
    items[index].updatedAt = new Date();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Item deleted successfully',
        });
      }, 500);
    });
  },

  async getItemCategories() {
    const categories = [...new Set(
      items
        .filter(item => item.isActive && item.category)
        .map(item => item.category!)
    )];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(categories);
      }, 200);
    });
  },

  async getItemsByIds(ids: string[]) {
    const foundItems = items.filter(item => ids.includes(item.id || ''));
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(foundItems);
      }, 300);
    });
  },
};

export default mockService;
