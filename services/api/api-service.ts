import { IApiService } from '@/lib/types';
import { PurchaseOrderFiltersParams } from '@/features/purchase-orders/types';
import { AdminCreateUser, AdminEditUser } from '@/features/users/schemas';
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
    companyId,
  }: {
    name: string;
    email: string;
    password: string;
    role?: string;
    companyId: string;
  }) {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        companyId,
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

  // User Management Endpoints (Admin only)
  async getUsers(filters: Record<string, string | number | boolean> = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const url = queryString ? `/api/auth/admin/users?${queryString}` : '/api/auth/admin/users';
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch users');
      }
      throw new Error('Network error while fetching users');
    }
  },

  async getUserById({ id }: { id: string }) {
    try {
      const response = await axios.get(`/api/auth/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user details error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch user details');
      }
      throw new Error('Network error while fetching user details');
    }
  },

  async addUser({ user }: { user: AdminCreateUser }) {
    try {
      const response = await axios.post('/api/auth/admin/users', user);
      return response.data;
    } catch (error) {
      console.error('Add user error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to create user');
      }
      throw new Error('Network error while creating user');
    }
  },

  async editUser({ id, data }: { id: string; data: AdminEditUser }) {
    try {
      const response = await axios.patch(`/api/auth/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Edit user error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update user');
      }
      throw new Error('Network error while updating user');
    }
  },

  async deleteUser({ id }: { id: string }) {
    try {
      const response = await axios.delete(`/api/auth/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to deactivate user');
      }
      throw new Error('Network error while deactivating user');
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
      const response = await axios.post('/api/customers', customer);
      return response.data; // Return the full response data which now includes the customer object
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

  // Enquiry File Endpoints
  async uploadEnquiryFiles({ enquiryId, files }) {
    try {
      console.log('API Service - uploadEnquiryFiles called');
      console.log('Enquiry ID:', enquiryId);
      console.log('Files:', files);
      console.log('Number of files:', files.length);
      
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        console.log(`Adding file ${index + 1}:`, file.name, file.size, 'bytes');
        formData.append('files', file);
      });

      console.log('Sending request to:', `/api/enquiries/${enquiryId}/files`);
      const response = await axios.post(`/api/enquiries/${enquiryId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading enquiry files:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to upload files');
      }
      throw new Error('Network error while uploading files');
    }
  },

  async getEnquiryFiles({ enquiryId }) {
    try {
      const response = await axios.get(`/api/enquiries/${enquiryId}/files`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enquiry files:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch files');
      }
      throw new Error('Network error while fetching files');
    }
  },

  async downloadEnquiryFile({ enquiryId, fileId }) {
    try {
      const response = await axios.get(`/api/enquiries/${enquiryId}/files/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading enquiry file:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error('Failed to download file');
      }
      throw new Error('Network error while downloading file');
    }
  },

  async deleteEnquiryFile({ enquiryId, fileId }) {
    try {
      const response = await axios.delete(`/api/enquiries/${enquiryId}/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting enquiry file:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to delete file');
      }
      throw new Error('Network error while deleting file');
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
  async getPurchaseOrders({
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
  }: PurchaseOrderFiltersParams = {}) {
    try {
      const purchaseOrders = await axios.get('/api/purchase-orders', {
        params: {
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
  async addPurchaseOrder({ purchaseOrder }) {
    try {
      await axios.post('/api/purchase-orders', purchaseOrder);
      return {
        message: 'Purchase Order added successfully',
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error adding new Purchase Order ${(error as Error).message}`
      );
    }
  },
  async getPurchaseOrderDetails({ id }) {
    try {
      const response = await axios.get(`/api/purchase-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      throw new Error('Failed to fetch purchase order details');
    }
  },
  async editPurchaseOrder({ id, data }) {
    try {
      const response = await axios.patch(`/api/purchase-orders/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error editing purchase order:', error);
      throw new Error('Failed to edit purchase order');
    }
  },
  // Metadata endpoints
  async getMetadata({ type }) {
    try {
      const params = type ? { type } : {};
      const response = await axios.get('/api/metadata', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw new Error(`Failed to fetch metadata: ${(error as Error).message}`);
    }
  },

  // Customer File Endpoints
  async uploadCustomerFiles({ customerId, files }) {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(`/api/customers/${customerId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading customer files:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to upload files');
      }
      throw new Error('Network error while uploading files');
    }
  },

  async getCustomerFiles({ customerId }) {
    try {
      const response = await axios.get(`/api/customers/${customerId}/files`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer files:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch files');
      }
      throw new Error('Network error while fetching files');
    }
  },

  async downloadCustomerFile({ customerId, fileId }) {
    try {
      const response = await axios.get(`/api/customers/${customerId}/files/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading customer file:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error('Failed to download file');
      }
      throw new Error('Network error while downloading file');
    }
  },

  async deleteCustomerFile({ customerId, fileId }) {
    try {
      const response = await axios.delete(`/api/customers/${customerId}/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer file:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to delete file');
      }
      throw new Error('Network error while deleting file');
    }
  },

  // BOM Endpoints
  async getBoms({
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
  } = {}) {
    try {
      const boms = await axios.get('/api/boms', {
        params: {
          page,
          limit,
          searchQuery,
          productNameFilter,
          bomTypeFilter,
          statusFilter,
          costFrom,
          costTo,
        },
      });
      return boms.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async addBom({ bom }) {
    try {
      const { data } = await axios.post('/api/boms', bom);
      return {
        message: 'BOM added successfully',
        success: true,
        bomNumber: data?.bomNumber,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Error adding new BOM ${(error as Error).message}`);
    }
  },

  async getBomById({ id }) {
    try {
      const bom = await axios.get(`/api/boms/${id}`);
      return bom.data;
    } catch (error) {
      console.error(error);
    }
  },

  async editBom({ id, data }) {
    try {
      const response = await axios.patch(`/api/boms/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(`Error editing BOM ${(error as Error).message}`);
    }
  },
};

export default apiService;
