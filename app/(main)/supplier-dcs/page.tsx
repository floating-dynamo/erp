import { Button } from '@/components/ui/button';
import SupplierDcTable from '@/features/supplier-dc/components/supplier-dc-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const SupplierDCPage = () => {
  return (
    <div className="w-full" data-testid="requirements-page">
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild>
          <Link href={'/supplier-dcs/create'}>
            <Plus /> Add new Supplier DC
          </Link>
        </Button>
      </div>
      <div>
        <SupplierDcTable />
      </div>
    </div>
  );
};

export default SupplierDCPage;
