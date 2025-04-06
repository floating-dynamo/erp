import { IApiService } from '@/lib/types';
import axios from 'axios';

const apiService: IApiService = {
  // Customer Endpoints
  async getCustomers(queryString: string = '') {
    try {
      const customers = await axios.get(`/api/customers${queryString}`);
      return customers.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addCustomer({ customer }) {
    try {
      await axios.post('/api/customers', customer);
      return {
        message: 'Customer added successfully',
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Error adding new customer ${(error as Error).message}`);
    }
  },
  async getCustomerById({ id }) {
    try {
      const customer = await axios.get(`/api/customers/${id}`);
      return customer.data;
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error fetching customer details ${(error as Error).message}`
      );
    }
  },
  async editCustomer({ id, data }) {
    try {
      const response = await axios.patch(`/api/customers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error editing customer details ${(error as Error).message}`
      );
    }
  },
  // Enquiry Endpoints
  async getEnquiries({ customerId }) {
    try {
      const enquiries = await axios.get('/api/enquiries', {
        params: {
          customerId,
        },
      });
      return enquiries.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error fetching customers ${(error as Error).message}`);
    }
  },
  async addEnquiry({ enquiry }) {
    try {
      await axios.post('/api/enquiries', enquiry);
      return {
        message: 'Enquiry added successfully',
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Error adding new eqnuiry ${(error as Error).message}`);
    }
  },
  async getEnquiryById({ id }) {
    try {
      const enquiry = await axios.get(`/api/enquiries/${id}`);
      return enquiry.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error fetching the eqnuiry ${(error as Error).message}`);
    }
  },
  async editEnquiry({ id, data }) {
    try {
      const response = await axios.patch(`/api/enquiries/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error editing enquiry details ${(error as Error).message}`
      );
    }
  },
  // Quotation Endpoints
  async getQuotations() {
    try {
      const quotations = await axios.get('/api/quotations');
      return quotations.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addQuotation({ quotation }) {
    try {
      const { data } = await axios.post('/api/quotations', quotation);
      return {
        message: 'Quotation added successfully',
        success: true,
        quoteNumber: data?.quoteNumber,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Error adding new enquiry ${(error as Error).message}`);
    }
  },
  async getQuotationById({ id }) {
    try {
      const quotation = await axios.get(`/api/quotations/${id}`);
      return quotation.data;
    } catch (error) {
      console.error(error);
    }
  },
  // Misc Endpoints
  async getCountries() {
    console.log('GET COUNTRIES WAS CALLED');
    try {
      const countries = await axios.get('/api/countries');
      return countries.data;
    } catch (error) {
      console.error(error);
    }
  },
};

export default apiService;
