'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, User, Mail, Building2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import APIService from '@/services/api';
import { useGetCompanies } from '@/features/companies/api/use-get-companies';
import Loader from '@/components/loader';

interface UserFormProps {
  userId?: string;
  mode: 'create' | 'edit';
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  companyId: string;
  isActive: boolean;
}

export default function UserForm({ userId, mode }: UserFormProps) {
  const [formData, setFormData] = React.useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    companyId: '',
    isActive: true,
  });
  const [initialLoading, setInitialLoading] = React.useState(mode === 'edit');
  const [submitting, setSubmitting] = React.useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { data: companies = [], isLoading: companiesLoading } = useGetCompanies();

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' },
    { value: 'viewer', label: 'Viewer' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'sales', label: 'Sales' },
    { value: 'purchase', label: 'Purchase' },
  ];

  // Fetch user data for editing
  React.useEffect(() => {
    const fetchUser = async () => {
      if (mode === 'edit' && userId) {
        try {
          setInitialLoading(true);
          const response = await APIService.getUserById({ id: userId });
          if (response.success && response.user) {
            const user = response.user;
            setFormData({
              name: user.name,
              email: user.email,
              password: '', // Don't populate password for security
              role: user.role,
              companyId: user.companyId,
              isActive: user.isActive,
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to fetch user details',
            });
            router.push('/users');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to fetch user details',
          });
          router.push('/users');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    fetchUser();
  }, [mode, userId, router, toast]);

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name is required',
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Email is required',
      });
      return false;
    }

    if (mode === 'create' && !formData.password.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Password is required for new users',
      });
      return false;
    }

    if (mode === 'create' && formData.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long',
      });
      return false;
    }

    if (!formData.companyId) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Company is required',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      let response;

      if (mode === 'create') {
        response = await APIService.addUser({
          user: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role as 'admin' | 'manager' | 'employee' | 'viewer' | 'accountant' | 'sales' | 'purchase',
            companyId: formData.companyId,
            isActive: formData.isActive,
          }
        });
      } else {
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role as 'admin' | 'manager' | 'employee' | 'viewer' | 'accountant' | 'sales' | 'purchase',
          companyId: formData.companyId,
          isActive: formData.isActive,
        };

        response = await APIService.editUser({ id: userId!, data: updateData });
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: `User ${mode === 'create' ? 'created' : 'updated'} successfully`,
        });
        router.push('/users');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || `Failed to ${mode} user`,
        });
      }
    } catch (error) {
      console.error(`Error ${mode}ing user:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${mode} user`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader text="Loading user details..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/users')}
        >
          <ArrowLeft className="size-4" />
          Back to Users
        </Button>
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New User' : 'Edit User'}
        </h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="size-4 inline mr-1" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="size-4 inline mr-1" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                <Shield className="size-4 inline mr-1" />
                Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={mode === 'create' ? 'Enter password' : 'Enter new password (optional)'}
                required={mode === 'create'}
                minLength={6}
              />
              {mode === 'create' && (
                <p className="text-sm text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Role and Company */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">
                  <Shield className="size-4 inline mr-1" />
                  Role *
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">
                  <Building2 className="size-4 inline mr-1" />
                  Company *
                </Label>
                <Select 
                  value={formData.companyId} 
                  onValueChange={(value) => handleInputChange('companyId', value)}
                  disabled={companiesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id || ''}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">
                Active User
              </Label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/users')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || companiesLoading}>
                <Save className="size-4 mr-2" />
                {submitting ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
