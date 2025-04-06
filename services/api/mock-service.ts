import { IApiService } from '@/lib/types';
import { CUSTOMERS_MOCK_DATA } from './mocks/customers';
import { Customer } from '@/features/customers/schemas';
import { Enquiry } from '@/features/enquiries/schemas';
import { ENQUIRIES_MOCK_DATA } from './mocks/enquiries';
import axios from 'axios';
import { Quotation } from '@/features/quotations/schemas';
import QUOTATIONS_MOCK_DATA from './mocks/quotations';

const customers: Customer[] = CUSTOMERS_MOCK_DATA;
const enquiries: Enquiry[] = ENQUIRIES_MOCK_DATA;
const quotations: Quotation[] = QUOTATIONS_MOCK_DATA;

const mockService: IApiService = {
  async getCustomers(queryString: string = '') {
    const params = new URLSearchParams(queryString);
    const country = params.get('country');
    const state = params.get('state');
    const city = params.get('city');

    const filteredCustomers = customers?.filter((customer) => {
      if (!customer?.address) return false;
      const countryMatch = country
        ? customer?.address.country === country
        : true;
      const stateMatch = state ? customer?.address.state === state : true;
      const cityMatch = city ? customer?.address.city === city : true;
      return countryMatch && stateMatch && cityMatch;
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          customers: filteredCustomers,
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
  async getEnquiries() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          enquiries,
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
  async getQuotations() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          quotations,
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
};

export default mockService;
