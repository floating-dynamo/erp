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
import Fuse from 'fuse.js';

const customers: Customer[] = CUSTOMERS_MOCK_DATA;
const enquiries: Enquiry[] = ENQUIRIES_MOCK_DATA;
const quotations: Quotation[] = QUOTATIONS_MOCK_DATA;
const companies: Company[] = COMPANIES_MOCK_DATA;
const supplierDcs: SupplierDc[] = SUPPLIER_DCS_MOCK_DATA;
const purchaseOrders: PurchaseOrder[] = PURCHASE_ORDERS_MOCK_DATA;

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

const mockService: IApiService = {
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
      filteredPurchaseOrders = filteredPurchaseOrders.filter(
        (po) => po.buyerName?.toLowerCase().includes(buyerNameFilter.toLowerCase())
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
      filteredPurchaseOrders = filteredPurchaseOrders.filter(
        (po) => po.deliveryDate ? new Date(po.deliveryDate) >= fromDate : false
      );
    }

    if (deliveryDateTo) {
      const toDate = new Date(deliveryDateTo);
      filteredPurchaseOrders = filteredPurchaseOrders.filter(
        (po) => po.deliveryDate ? new Date(po.deliveryDate) <= toDate : false
      );
    }

    // Apply total value range filters with type safety checks
    if (totalValueFrom) {
      const minValue = parseFloat(String(totalValueFrom));
      filteredPurchaseOrders = filteredPurchaseOrders.filter(
        (po) => typeof po.totalValue === 'number' ? po.totalValue >= minValue : false
      );
    }

    if (totalValueTo) {
      const maxValue = parseFloat(String(totalValueTo));
      filteredPurchaseOrders = filteredPurchaseOrders.filter(
        (po) => typeof po.totalValue === 'number' ? po.totalValue <= maxValue : false
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
      paginatedPurchaseOrders = filteredPurchaseOrders.slice(startIndex, endIndex);
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
};

export default mockService;
