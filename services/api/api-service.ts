import { IApiService } from '@/lib/types';
import { PurchaseOrderFiltersParams } from '@/features/purchase-orders/types';
import { UOM, Currency } from '@/features/metadata/schemas';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true; // Enable cookies for authentication

// Add request interceptor to include JWT token in headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const apiService: IApiService = {
  // Authentication Endpoints
  async login({ email, password }: { email: string; password: string }) {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error during login');
    }
  },
  async register({
    name,
    email,
    password,
    role = 'employee',
  }: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Network error during registration');
    }
  },
  async logout() {
    try {
      const response = await axios.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout, just log it
      return { success: false };
    }
  },
  async getCurrentUser() {
    try {
      const response = await axios.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Failed to get user profile'
        );
      }
      throw new Error('Network error while fetching user profile');
    }
  },
  async updateProfile({ name, email }: { name: string; email: string }) {
    try {
      const response = await axios.patch('/api/auth/profile', { name, email });
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Failed to update profile'
        );
      }
      throw new Error('Network error while updating profile');
    }
  },
  async changePassword({
    currentPassword,
    newPassword,
    confirmPassword,
  }: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    try {
      const response = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || 'Failed to change password'
        );
      }
      throw new Error('Network error while changing password');
    }
  },

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
  async getEnquiries({
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
  } = {}) {
    try {
      const enquiries = await axios.get('/api/enquiries', {
        params: {
          customerId,
          page,
          limit,
          searchQuery,
          customerFilter,
          dueDateFrom,
          dueDateTo,
          quotationCreated,
        },
      });
      return enquiries.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error fetching enquiries ${(error as Error).message}`);
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
  async getQuotations({
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
  } = {}) {
    try {
      const quotations = await axios.get('/api/quotations', {
        params: {
          page,
          limit,
          searchQuery,
          customerFilter,
          enquiryNumberFilter,
          amountFrom,
          amountTo,
        },
      });
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
  // Metadata endpoints
  async getMetadata({
    type,
  }: {
    type?: MetaDataType;
  }) {
    try {
      const response = await axios.get('/api/metadata', {
        params: { type },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error fetching metadata ${(error as Error).message}`);
    }
  },

  // Settings & Metadata CRUD Endpoints
  async upsertUOM({
    uom,
  }: {
    uom: UOM;
  }) {
    try {
      const response = await axios.post('/api/metadata/uom', { uom });
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error saving UOM ${(error as Error).message}`);
    }
  },

  async upsertCurrency({
    currency,
  }: {
    currency: Currency;
  }) {
    try {
      const response = await axios.post('/api/metadata/currency', { currency });
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error saving currency ${(error as Error).message}`);
    }
  },

  // Settings & Company Management Endpoints
  async getMyCompanies() {
    try {
      const response = await axios.get('/api/companies/my-companies');
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error fetching my companies ${(error as Error).message}`);
    }
  },

  async setActiveCompany({
    companyId,
  }: {
    companyId: string;
  }) {
    try {
      const response = await axios.post('/api/companies/set-active', {
        companyId,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error setting active company ${(error as Error).message}`);
    }
  },

  async getCountries() {
    try {
      const countries = await axios.get('/api/countries');
      return countries.data;
    } catch (error) {
      console.error(error);
    }
  },
};

export default apiService;
