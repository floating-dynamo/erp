'use client'
import React from 'react';
import { usePathname } from 'next/navigation';

import { MobileSidebar } from './sidebar/mobile-sidebar';

const Navbar = () => {
  const pathname = usePathname();

  const pageDetails = React.useMemo(() => {
    switch (pathname) {
      case '/dashboard':
        return {
          title: 'Dashboard',
          description: 'Monitor all your customer data here',
        };
      case '/companies':
        return {
          title: 'My Company',
          description: 'Manage your company details and records',
        };
      case '/customers':
        return {
          title: 'Customers',
          description: 'View and manage customer information',
        };
      case '/enquiries':
        return {
          title: 'Enquiries',
          description: 'Track and manage customer enquiries',
        };
      case '/quotations':
        return {
          title: 'Quotations',
          description: 'Manage and create quotations for customers',
        };
      case '/settings':
        return {
          title: 'Settings',
          description: 'Configure your application settings',
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Monitor all your customer data here',
        };
    }
  }, [pathname]);

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{pageDetails.title}</h1>
        <p className="text-muted-foreground">{pageDetails.description}</p>
      </div>
      <MobileSidebar />
    </nav>
  );
};

export default Navbar;
