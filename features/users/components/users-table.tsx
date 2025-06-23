'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useUsers } from '../api/use-users';
import { useDeleteUser } from '../api/use-delete-user';
import { useEditUser } from '../api/use-edit-user';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { format } from 'date-fns';
import { User } from '../schemas';

// Extended User interface to handle database responses that may include _id
interface DatabaseUser extends Omit<User, 'password' | 'tokens'> {
  _id?: string;
  password?: string;
  tokens?: string[];
  companyName?: string; // Add company name field
}

const USER_ROLES = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'sales', label: 'Sales' },
  { value: 'purchase', label: 'Purchase' },
];

const USER_STATUS = [
  { value: 'all', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

interface UserTableProps {
  onCreateUser?: () => void;
  onEditUser?: (userId: string) => void;
}

export const UsersTable = ({ onEditUser }: UserTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const router = useRouter();

  const filters = {
    page: currentPage,
    limit: pageSize,
    searchQuery: debouncedSearchQuery,
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter !== 'all' && { isActive: statusFilter === 'true' }),
  };

  const { data, isLoading, error } = useUsers(filters);
  const { mutate: deleteUser, isPending: isDeletingUser } = useDeleteUser();
  const { mutate: editUser, isPending: isUpdatingUser } = useEditUser();

  const users = (data?.users || []) as DatabaseUser[];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Helper function to get user ID consistently
  const getUserId = (user: DatabaseUser): string => {
    return user.id || user._id || '';
  };

  const handleEditUser = (userId: string) => {
    if (onEditUser) {
      onEditUser(userId);
    } else {
      router.push(`/users/${userId}/edit`);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    editUser({
      id: userId,
      user: { isActive: !currentStatus },
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'employee':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search users...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by role' />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                {USER_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex items-center justify-center h-32'>
              <div className='w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin' />
            </div>
          ) : error ? (
            <div className='text-center text-red-500 h-32 flex items-center justify-center'>
              Error loading users
            </div>
          ) : users.length === 0 ? (
            <div className='text-center text-muted-foreground h-32 flex items-center justify-center'>
              No users found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: DatabaseUser) => {
                    const userId = getUserId(user);
                    return (
                      <TableRow key={userId}>
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{user.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm'>{user.email}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-2'>
                            {user.isActive ? (
                              <UserCheck className='h-4 w-4 text-green-500' />
                            ) : (
                              <UserX className='h-4 w-4 text-red-500' />
                            )}
                            <span
                              className={
                                user.isActive ? 'text-green-700' : 'text-red-700'
                              }
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm'>
                            {user.companyName || 'No Company'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.lastLoginAt ? (
                            <span className='text-sm'>
                              {format(new Date(user.lastLoginAt), 'MMM dd, yyyy')}
                            </span>
                          ) : (
                            <span className='text-sm text-muted-foreground'>
                              Never
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? (
                            <span className='text-sm'>
                              {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                            </span>
                          ) : (
                            <span className='text-sm text-muted-foreground'>
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Open menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEditUser(userId)}
                                disabled={isUpdatingUser}
                              >
                                <Edit className='mr-2 h-4 w-4' />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleUserStatus(userId, user.isActive)}
                                disabled={isUpdatingUser}
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className='mr-2 h-4 w-4' />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className='mr-2 h-4 w-4' />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(userId)}
                                className='text-red-600'
                                disabled={isDeletingUser}
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between space-x-2 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, total)} of {total} users
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className='text-sm font-medium'>
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteUser}
        title='Delete User'
        description='Are you sure you want to delete this user? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        variant='destructive'
        isLoading={isDeletingUser}
      />
    </div>
  );
};
