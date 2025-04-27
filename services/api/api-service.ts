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
  async editQuotation({ id, data }) {
    try {
      const response = await axios.patch(`/api/quotations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error editing quotation ${(error as Error).message}`);
    }
  },
  // Misc Endpoints
  async getCountries() {
    try {
      const countries = await axios.get('/api/countries');
      return countries.data;
    } catch (error) {
      console.error(error);
    }
  },
  // Company Endpoints
  async addCompany({ company }) {
    try {
      await axios.post('/api/companies', company);
      return {
        message: 'Company added successfully',
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Error adding new company ${(error as Error).message}`);
    }
  },
  async getCompanies() {
    try {
      const response = await axios.get('/api/companies');
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error fetching companies ${(error as Error).message}`);
    }
  },
  // Supplier DC endpoints
  async getSupplierDcs() {
    try {
      const response = await axios.get('/api/supplier-dcs');
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error fetching supplier dcs ${(error as Error).message}`
      );
    }
  },
  async addSupplierDc({ supplierDc }) {
    try {
      await axios.post('/api/supplier-dcs', supplierDc);
      return {
        message: 'Supplier DC added successfully',
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error adding new supplier dc ${(error as Error).message}`
      );
    }
  },
  async getSupplierDCById({ id }) {
    try {
      const response = await axios.get(`/api/supplier-dcs/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error fetching supplier dc details ${(error as Error).message}`
      );
    }
  },
  async editSupplierDc({ id, data }) {
    try {
      const response = await axios.patch(`/api/supplier-dcs/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error editing supplier dc details ${(error as Error).message}`
      );
    }
  },
  async getPurchaseOrders({ customerId }) {
    try {
      const purchaseOrders = await axios.get('/api/purchase-orders', {
        params: {
          customerId,
        },
      });
      return purchaseOrders.data;
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error fetching Purchase Orders ${(error as Error).message}`
      );
    }
  },
};

export default apiService;
