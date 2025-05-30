"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import Loader from '@/components/loader';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        // Not authenticated and trying to access protected route
        router.push('/login');
      } else if (isAuthenticated && isPublicRoute) {
        // Already authenticated and trying to access public route
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader text="Loading..." />
      </div>
    );
  }

  // Show children for public routes or authenticated users
  if (isPublicRoute || isAuthenticated) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader text="Redirecting..." />
    </div>
  );
};