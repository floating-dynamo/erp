import { z } from 'zod';

// Define the schema for User roles
export const userRoleSchema = z.enum([
  'admin',
  'manager',
  'employee',
  'viewer',
  'accountant',
  'sales',
  'purchase',
]);

// Define the schema for User privileges
export const userPrivilegeSchema = z.enum([
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
]);

// Define the schema for creating a User
export const createUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: userRoleSchema,
  privileges: z.array(userPrivilegeSchema).default([]),
  tokens: z.array(z.string()).default([]),
  name: z.string().trim().min(1, 'Name is required'),
  isActive: z.boolean().default(true),
  companyId: z.string().min(1, 'Company is required'),
  companyName: z.string().optional(), // Add company name field
  lastLoginAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Define the schema for updating a User (all fields optional except id)
export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string(),
});

// Define the schema for user login
export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Define the schema for user registration
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().trim().min(1, 'Name is required'),
  role: userRoleSchema.default('employee'),
  companyId: z.string().min(1, 'Company is required'),
});

// Define the schema for changing password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Define the schema for reset password
export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Define the schema for updating user profile
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

// Type exports
export type User = z.infer<typeof createUserSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserPrivilege = z.infer<typeof userPrivilegeSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;