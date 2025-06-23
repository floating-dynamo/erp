'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Mail,
  Calendar,
  Clock,
  Building2,
  Shield,
  User,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useGetUserDetails } from '../api/use-get-user-details';
import { format } from 'date-fns';
import Loader from '@/components/loader';

interface UserDetailsProps {
  userId: string;
}

export const UserDetails = ({ userId }: UserDetailsProps) => {
  const router = useRouter();
  const { data: user, isLoading, error } = useGetUserDetails({ id: userId });

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
      case 'accountant':
        return 'secondary';
      case 'sales':
        return 'default';
      case 'purchase':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatPrivileges = (privileges: string[]) => {
    if (!privileges || privileges.length === 0) return [];
    
    const groupedPrivileges: { [key: string]: string[] } = {};
    
    privileges.forEach((privilege) => {
      const [module, action] = privilege.split('.');
      if (!groupedPrivileges[module]) {
        groupedPrivileges[module] = [];
      }
      groupedPrivileges[module].push(action);
    });
    
    return groupedPrivileges;
  };

  if (isLoading) {
    return <Loader text="Loading user details..." />;
  }

  if (error || !user) {
    return (
      <div className="w-full">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-red-500">Error loading user details</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedPrivileges = formatPrivileges(user.privileges || []);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-muted-foreground">View and manage user information</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/users/${userId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <div className="flex items-center mt-2">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role</span>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center">
                  {user.isActive ? (
                    <>
                      <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-700">Active</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-700">Inactive</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Company ID</span>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm">{user.companyId}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Login</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm">
                    {user.lastLoginAt 
                      ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm')
                      : 'Never'
                    }
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Created</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privileges */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Permissions & Privileges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedPrivileges).length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No specific privileges assigned</p>
                <p className="text-sm">User has default role-based permissions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(groupedPrivileges).map(([module, actions]) => (
                  <Card key={module} className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium capitalize">
                        {module.replace('-', ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {actions.map((action) => (
                          <Badge
                            key={action}
                            variant="outline"
                            className="text-xs"
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {user.role === 'admin' ? 'Full' : 'Limited'}
              </div>
              <div className="text-sm text-muted-foreground">Access Level</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {user.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-muted-foreground">Account Status</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {user.lastLoginAt ? 'Recent' : 'Never'}
              </div>
              <div className="text-sm text-muted-foreground">Login Activity</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};