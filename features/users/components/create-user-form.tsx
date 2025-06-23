'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from '../schemas';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Eye, EyeOff, Check, ChevronsUpDown } from 'lucide-react';
import { useAddUser } from '../api/use-add-user';
import { useEditUser } from '../api/use-edit-user';
import { useGetUserDetails } from '../api/use-get-user-details';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGetCompanies } from '@/features/companies/api/use-get-companies';
import { cn } from '@/lib/utils';
import Loader from '@/components/loader';

interface CreateUserFormProps {
  onCancel?: () => void;
  userId?: string;
  showBackButton?: boolean;
}

interface Company {
  id?: string;
  _id?: string;
  name: string;
}

type ZodCreateUserSchema = z.infer<typeof createUserSchema>;

const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'sales', label: 'Sales' },
  { value: 'purchase', label: 'Purchase' },
];

// Role-based privilege templates
const ROLE_PRIVILEGE_TEMPLATES = {
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
    'export.pdf', 'export.excel',
  ],
  manager: [
    'users.read', 'users.update',
    'customers.create', 'customers.read', 'customers.update',
    'companies.read',
    'enquiries.create', 'enquiries.read', 'enquiries.update', 'enquiries.delete',
    'quotations.create', 'quotations.read', 'quotations.update', 'quotations.delete',
    'purchase-orders.create', 'purchase-orders.read', 'purchase-orders.update',
    'supplier-dcs.create', 'supplier-dcs.read', 'supplier-dcs.update',
    'reports.read',
    'export.pdf', 'export.excel',
  ],
  employee: [
    'customers.read',
    'companies.read',
    'enquiries.create', 'enquiries.read', 'enquiries.update',
    'quotations.create', 'quotations.read', 'quotations.update',
    'purchase-orders.read',
    'supplier-dcs.read',
    'export.pdf',
  ],
  viewer: [
    'customers.read',
    'companies.read',
    'enquiries.read',
    'quotations.read',
    'purchase-orders.read',
    'supplier-dcs.read',
    'reports.read',
  ],
  accountant: [
    'customers.read', 'customers.update',
    'companies.read',
    'enquiries.read',
    'quotations.read', 'quotations.update',
    'purchase-orders.read', 'purchase-orders.update',
    'supplier-dcs.read', 'supplier-dcs.update',
    'reports.read',
    'export.pdf', 'export.excel',
  ],
  sales: [
    'customers.create', 'customers.read', 'customers.update',
    'companies.read',
    'enquiries.create', 'enquiries.read', 'enquiries.update',
    'quotations.create', 'quotations.read', 'quotations.update',
    'reports.read',
    'export.pdf', 'export.excel',
  ],
  purchase: [
    'customers.read',
    'companies.read',
    'enquiries.read',
    'quotations.read',
    'purchase-orders.create', 'purchase-orders.read', 'purchase-orders.update',
    'supplier-dcs.create', 'supplier-dcs.read', 'supplier-dcs.update',
    'reports.read',
    'export.pdf', 'export.excel',
  ],
} as const;

const USER_PRIVILEGES = [
  { value: 'users.create', label: 'Create Users' },
  { value: 'users.read', label: 'View Users' },
  { value: 'users.update', label: 'Edit Users' },
  { value: 'users.delete', label: 'Delete Users' },
  { value: 'customers.create', label: 'Create Customers' },
  { value: 'customers.read', label: 'View Customers' },
  { value: 'customers.update', label: 'Edit Customers' },
  { value: 'customers.delete', label: 'Delete Customers' },
  { value: 'companies.create', label: 'Create Companies' },
  { value: 'companies.read', label: 'View Companies' },
  { value: 'companies.update', label: 'Edit Companies' },
  { value: 'companies.delete', label: 'Delete Companies' },
  { value: 'enquiries.create', label: 'Create Enquiries' },
  { value: 'enquiries.read', label: 'View Enquiries' },
  { value: 'enquiries.update', label: 'Edit Enquiries' },
  { value: 'enquiries.delete', label: 'Delete Enquiries' },
  { value: 'quotations.create', label: 'Create Quotations' },
  { value: 'quotations.read', label: 'View Quotations' },
  { value: 'quotations.update', label: 'Edit Quotations' },
  { value: 'quotations.delete', label: 'Delete Quotations' },
  { value: 'purchase-orders.create', label: 'Create Purchase Orders' },
  { value: 'purchase-orders.read', label: 'View Purchase Orders' },
  { value: 'purchase-orders.update', label: 'Edit Purchase Orders' },
  { value: 'purchase-orders.delete', label: 'Delete Purchase Orders' },
  { value: 'supplier-dcs.create', label: 'Create Supplier DCs' },
  { value: 'supplier-dcs.read', label: 'View Supplier DCs' },
  { value: 'supplier-dcs.update', label: 'Edit Supplier DCs' },
  { value: 'supplier-dcs.delete', label: 'Delete Supplier DCs' },
  { value: 'settings.read', label: 'View Settings' },
  { value: 'settings.update', label: 'Edit Settings' },
  { value: 'reports.read', label: 'View Reports' },
  { value: 'export.pdf', label: 'Export PDF' },
  { value: 'export.excel', label: 'Export Excel' },
] as const;

export const CreateUserForm = ({
  onCancel,
  userId,
  showBackButton = false,
}: CreateUserFormProps) => {
  const {
    data: userData,
    isFetching: isFetchingUser,
    status: fetchUserStatus,
  } = useGetUserDetails({ id: userId || '' });
  
  const { mutate: addUser, isPending: isPendingAddUser } = useAddUser();
  const { mutate: editUser, isPending: isPendingEditUser } = useEditUser();
  const { data: companies = [], isLoading: isLoadingCompanies } = useGetCompanies();
  
  const [showPassword, setShowPassword] = useState(false);
  const [companySelectOpen, setCompanySelectOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const isEdit = !!userId;
  const router = useRouter();
  const isPending = isPendingAddUser || isPendingEditUser;

  const form = useForm<ZodCreateUserSchema>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'employee',
      privileges: [],
      isActive: true,
      companyId: '',
    },
  });

  // Helper function to apply role-based privilege template
  const applyRolePrivileges = (role: string) => {
    const rolePrivileges = ROLE_PRIVILEGE_TEMPLATES[role as keyof typeof ROLE_PRIVILEGE_TEMPLATES] || [];
    form.setValue('privileges', [...rolePrivileges] as (typeof USER_PRIVILEGES)[number]['value'][]);
  };

  // Load user data for editing
  useEffect(() => {
    if (isEdit && userData && fetchUserStatus === 'success') {
      form.reset({
        name: userData.name || '',
        email: userData.email || '',
        password: '', // Don't pre-fill password for security
        role: (userData.role as 'admin' | 'manager' | 'employee' | 'viewer' | 'accountant' | 'sales' | 'purchase') || 'employee',
        privileges: (userData.privileges || []) as (typeof USER_PRIVILEGES)[number]['value'][],
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        companyId: userData.companyId || '',
      });
      setFormKey(prev => prev + 1);
    }
  }, [userData, isEdit, fetchUserStatus, form]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/users');
    }
  };

  const onSubmit = (values: ZodCreateUserSchema) => {
    if (isEdit) {
      const updateData: Partial<ZodCreateUserSchema> = { ...values };
      // Don't send password if it's empty (keep existing password)
      if (!updateData.password) {
        updateData.password = undefined;
      }
      editUser(
        { id: userId!, user: updateData },
        {
          onSuccess: () => {
            handleCancel();
          },
        }
      );
    } else {
      addUser(values, {
        onSuccess: () => {
          handleCancel();
        },
      });
    }
  };

  if (isLoadingCompanies || isFetchingUser) {
    return <Loader />;
  }

  const companySelectData = companies?.map((company: Company) => ({
    value: company.id || company._id || '',
    label: company.name,
  })) || [];

  return (
    <Card key={formKey} className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold flex items-center">
          {showBackButton && (
            <Button
              variant="outline"
              type="button"
              size="icon"
              onClick={handleCancel}
              disabled={isPending}
              className={cn(!onCancel && 'invisible')}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          {isEdit ? 'Edit User' : 'Create New User'}
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter full name"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isEdit ? 'New Password (leave empty to keep current)' : 'Password'} <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={isEdit ? 'Enter new password' : 'Enter password'}
                          disabled={isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Role <span className="text-orange-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Apply role-based privilege template when role changes
                        if (!isEdit) {
                          applyRolePrivileges(value);
                        }
                      }}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Popover open={companySelectOpen} onOpenChange={setCompanySelectOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between disabled:text-slate-700',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={isPending}
                            >
                              {field.value
                                ? companySelectData.find(
                                    (company) => company.value === field.value
                                  )?.label
                                : 'Select Company'}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search Company..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No Company found.</CommandEmpty>
                              <CommandGroup>
                                {companySelectData.map((company) => (
                                  <CommandItem
                                    value={company.label}
                                    key={company.value}
                                    onSelect={() => {
                                      form.setValue('companyId', company.value);
                                      setCompanySelectOpen(false);
                                    }}
                                  >
                                    {company.label}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        company.value === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active User</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        User can login and access the system
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-7" />

            {/* Privileges */}
            <FormField
              control={form.control}
              name="privileges"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Privileges</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Select additional privileges for this user. Role-based privileges are automatically selected when you choose a role.
                    </p>
                    {!isEdit && (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentRole = form.getValues('role');
                            if (currentRole) {
                              applyRolePrivileges(currentRole);
                            }
                          }}
                          disabled={isPending}
                        >
                          Apply Role Template
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {USER_PRIVILEGES.map((privilege) => (
                      <FormField
                        key={privilege.value}
                        control={form.control}
                        name="privileges"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(privilege.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, privilege.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== privilege.value
                                          )
                                        );
                                  }}
                                  disabled={isPending}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {privilege.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-end">
              <Button type="submit" size="lg" disabled={isPending}>
                {isEdit ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};