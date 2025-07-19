export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer' | 'accountant' | 'sales' | 'purchase';
  privileges: string[];
  isActive: boolean;
  companyId: string;
  companyName?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFiltersParams {
  role?: string;
  isActive?: boolean;
  companyId?: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddUserResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface EditUserResponse {
  success: boolean;
  message: string;
}

export interface UserFilterFormValues {
  roleFilter: string;
  isActiveFilter: string;
  companyFilter: string;
  lastLoginFrom: string;
  lastLoginTo: string;
  createdFrom: string;
  createdTo: string;
}
