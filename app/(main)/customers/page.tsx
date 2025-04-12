import { Button } from '@/components/ui/button';
import CustomerTable from '@/features/customers/components/customer-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const CustomersPage = () => {
  return (
    <div className="w-full" data-testid="customers-page">
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild>
          <Link href={'/customers/create'}>
            <Plus /> Add new Customer
          </Link>
        </Button>
      </div>
      <div>
        <CustomerTable />
      </div>
    </div>
  );
};

export default CustomersPage;
