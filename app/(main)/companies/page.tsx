'use client';
import React from 'react';
import CompanyTable from '@/features/companies/components/company-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const MyCompany = () => {
  return (
    <div className="w-full" data-testid="requirements-page">
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild>
          <Link href={'/companies/create'}>
            <Plus /> Add new Company
          </Link>
        </Button>
      </div>
      <div>
        <CompanyTable />
      </div>
    </div>
  );
};

export default MyCompany;
