'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Building2, 
  Calendar, 
  Shield, 
  Activity,
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import Loader from '@/components/loader';
import { useToast } from '@/hooks/use-toast';
import APIService from '@/services/api';
import { User as UserType } from '@/lib/types/user';

interface UserDetailsProps {
  userId: string;
}

export default function UserDetails({ userId }: UserDetailsProps) {
  const [user, setUser] = React.useState<UserType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await APIService.getUserById({ id: userId });
        if (response.success && response.user) {
          setUser(response.user);
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
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, router, toast]);

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleDelete = async () => {
    if (!user) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const response = await APIService.deleteUser({ id: userId });
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
        router.push('/users');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to delete user',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'employee':
        return 'secondary';
      case 'viewer':
        return 'outline';
      case 'accountant':
        return 'secondary';
      case 'sales':
        return 'default';
      case 'purchase':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader text="Loading user details..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-lg text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/users')}
          >
            <ArrowLeft className="size-4" />
            Back to Users
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="size-4" />
            Edit User
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="size-4" />
            {deleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </div>

      {/* User Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <p>{user.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Role & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Role & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div className="mt-1">
                <Badge variant={getRoleVariant(user.role)} className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex items-center gap-2 mt-1">
                <Activity className={`size-4 ${user.isActive ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company</label>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="size-4 text-muted-foreground" />
                <p>{user.companyName || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Activity Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Login</label>
              <p>{user.lastLoginAt ? formatDate(new Date(user.lastLoginAt)) : 'Never'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Created</label>
              <p>{formatDate(new Date(user.createdAt))}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p>{formatDate(new Date(user.updatedAt))}</p>
            </div>
          </CardContent>
        </Card>

        {/* Privileges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Privileges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.privileges && user.privileges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.privileges.map((privilege, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {privilege}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No custom privileges assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
