import { IApiService } from '@/lib/types';
import { CUSTOMERS_MOCK_DATA } from './mocks/customers';
import { Customer } from '@/features/customers/schemas';
import { Enquiry } from '@/features/enquiries/schemas';
import { ENQUIRIES_MOCK_DATA } from './mocks/enquiries';
import axios from 'axios';
import { Quotation } from '@/features/quotations/schemas';
import QUOTATIONS_MOCK_DATA from './mocks/quotations';
import { COMPANIES_MOCK_DATA } from './mocks/companies';
import { Company } from '@/features/companies/schemas';
import { SupplierDc } from '@/features/supplier-dc/schemas';
import { SUPPLIER_DCS_MOCK_DATA } from './mocks/supplier-dcs';
import { PurchaseOrder } from '@/features/purchase-orders/schemas';
import { PURCHASE_ORDERS_MOCK_DATA } from './mocks/purchase-orders';

const customers: Customer[] = CUSTOMERS_MOCK_DATA;
const enquiries: Enquiry[] = ENQUIRIES_MOCK_DATA;
const quotations: Quotation[] = QUOTATIONS_MOCK_DATA;
const companies: Company[] = COMPANIES_MOCK_DATA;
const supplierDcs: SupplierDc[] = SUPPLIER_DCS_MOCK_DATA;
const purchaseOrders: PurchaseOrder[] = PURCHASE_ORDERS_MOCK_DATA;

const mockService: IApiService = {
  async getCustomers(queryString: string = '') {
    const params = new URLSearchParams(queryString);
    const country = params.get('country');
    const state = params.get('state');
    const city = params.get('city');
    const page = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '10', 10);
    // Check if there's a search query in the params
    const searchQuery = params.get('searchQuery') || '';
    const isSearching = searchQuery.trim().length > 0;

    const filteredCustomers = customers?.filter((customer) => {
      if (!customer?.address) return false;
      const countryMatch = country
        ? customer?.address.country === country
        : true;
      const stateMatch = state ? customer?.address.state === state : true;
      const cityMatch = city ? customer?.address.city === city : true;
      return countryMatch && stateMatch && cityMatch;
    });

    const totalCustomers = filteredCustomers?.length || 0;

    // If searching, bypass pagination and return all records (pagination will be handled client-side)
    let paginatedCustomers;
    if (isSearching) {
      paginatedCustomers = filteredCustomers;
    } else {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedCustomers = filteredCustomers?.slice(startIndex, endIndex);
    }

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
    customers.push(customer);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Customer added successfully',
          success: true,
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
  async getEnquiries({ customerId, page = 1, limit = 10, searchQuery = '' } = {}) {
    // Filter by customerId if provided
    const filteredEnquiries = customerId 
      ? enquiries.filter((enquiry) => enquiry.customerId === customerId) 
      : enquiries;
    
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
  async getCountries() {
    try {
      const countries = await axios.get('/api/countries');
      return countries.data;
    } catch (error) {
      console.error(error);
    }
  },
  async getQuotations({ page = 1, limit = 10, searchQuery = '' } = {}) {
    // Check if there's a search query
    const isSearching = searchQuery?.trim().length > 0;
    
    // Filter quotations based on search query if provided
    let filteredQuotations = [...quotations];
    if (isSearching) {
      const query = searchQuery.toLowerCase();
      filteredQuotations = quotations.filter(quotation => {
        return (
          (quotation.customerName && quotation.customerName.toLowerCase().includes(query)) ||
          (quotation.enquiryNumber && quotation.enquiryNumber.toLowerCase().includes(query)) ||
          (quotation.quoteNumber && quotation.quoteNumber.toLowerCase().includes(query)) ||
          (quotation.totalAmount && quotation.totalAmount.toString().includes(query))
        );
      });
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
    quotations.push(quotation);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Quotation added successfully',
          success: true,
          quoteNumber: quotation.quoteNumber || '',
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
  async getPurchaseOrders() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          purchaseOrders,
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
};

export default mockService;
