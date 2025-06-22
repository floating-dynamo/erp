import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './schemas';

// Interface extending Document with User properties
interface IUser extends Document, Omit<User, 'id'> {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  removeToken(token: string): void;
  hasPrivilege(privilege: string): boolean;
  getRolePrivileges(): string[];
  allPrivileges: string[];
}

// Define the User schema
const userSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    index: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    required: true,
    enum: ['admin', 'manager', 'employee', 'viewer', 'accountant', 'sales', 'purchase'],
    default: 'employee'
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  privileges: [{
    type: String,
    enum: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'customers.create', 'customers.read', 'customers.update', 'customers.delete',
      'companies.create', 'companies.read', 'companies.update', 'companies.delete',
      'enquiries.create', 'enquiries.read', 'enquiries.update', 'enquiries.delete',
      'quotations.create', 'quotations.read', 'quotations.update', 'quotations.delete',
      'purchase-orders.create', 'purchase-orders.read', 'purchase-orders.update', 'purchase-orders.delete',
      'supplier-dcs.create', 'supplier-dcs.read', 'supplier-dcs.update', 'supplier-dcs.delete',
      'settings.read', 'settings.update',
      'reports.read',
      'export.pdf', 'export.excel'
    ]
  }],
  tokens: [{ 
    type: String 
  }],
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLoginAt: { 
    type: Date 
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre<IUser>('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate auth token
userSchema.methods.generateAuthToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.tokens.push(token);
  return token;
};

// Instance method to remove token
userSchema.methods.removeToken = function(token: string): void {
  this.tokens = this.tokens.filter((t: string) => t !== token);
};

// Instance method to check if user has specific privilege
userSchema.methods.hasPrivilege = function(privilege: string): boolean {
  return this.privileges.includes(privilege) || this.role === 'admin';
};

// Instance method to get role-based default privileges
userSchema.methods.getRolePrivileges = function(): string[] {
  const rolePrivileges: Record<string, string[]> = {
    admin: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'customers.create', 'customers.read', 'customers.update', 'customers.delete',
      'companies.create', 'companies.read', 'companies.update', 'companies.delete',
      'enquiries.create', 'enquiries.read', 'enquiries.update', 'enquiries.delete',
      'quotations.create', 'quotations.read', 'quotations.update', 'quotations.delete',
      'purchase-orders.create', 'purchase-orders.read', 'purchase-orders.update', 'purchase-orders.delete',
      'supplier-dcs.create', 'supplier-dcs.read', 'supplier-dcs.update', 'supplier-dcs.delete',
      'settings.read', 'settings.update',
      'reports.read',
      'export.pdf', 'export.excel'
    ],
    manager: [
      'users.read',
      'customers.create', 'customers.read', 'customers.update',
      'companies.read',
      'enquiries.create', 'enquiries.read', 'enquiries.update', 'enquiries.delete',
      'quotations.create', 'quotations.read', 'quotations.update', 'quotations.delete',
      'purchase-orders.create', 'purchase-orders.read', 'purchase-orders.update',
      'supplier-dcs.create', 'supplier-dcs.read', 'supplier-dcs.update',
      'reports.read',
      'export.pdf', 'export.excel'
    ],
    accountant: [
      'customers.read',
      'companies.read',
      'quotations.read',
      'purchase-orders.read', 'purchase-orders.update',
      'supplier-dcs.read',
      'reports.read',
      'export.pdf', 'export.excel'
    ],
    sales: [
      'customers.create', 'customers.read', 'customers.update',
      'companies.read',
      'enquiries.create', 'enquiries.read', 'enquiries.update',
      'quotations.create', 'quotations.read', 'quotations.update',
      'reports.read'
    ],
    purchase: [
      'companies.read',
      'purchase-orders.create', 'purchase-orders.read', 'purchase-orders.update',
      'supplier-dcs.create', 'supplier-dcs.read', 'supplier-dcs.update',
      'reports.read'
    ],
    employee: [
      'customers.read',
      'companies.read',
      'enquiries.read',
      'quotations.read',
      'purchase-orders.read',
      'supplier-dcs.read'
    ],
    viewer: [
      'customers.read',
      'companies.read',
      'enquiries.read',
      'quotations.read',
      'purchase-orders.read',
      'supplier-dcs.read'
    ]
  };
  
  return rolePrivileges[this.role] || [];
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Add proper typing for static methods
interface UserModelType extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
}

// Virtual for user's full privileges (role + custom)
userSchema.virtual('allPrivileges').get(function(this: IUser) {
  const rolePrivileges = this.getRolePrivileges();
  const customPrivileges = this.privileges || [];
  return [...new Set([...rolePrivileges, ...customPrivileges])];
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const UserModel = 
  (mongoose.models.User as UserModelType) || 
  (mongoose.model<IUser>('User', userSchema) as UserModelType);

export default UserModel;