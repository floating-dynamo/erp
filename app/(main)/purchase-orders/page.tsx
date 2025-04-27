import { Button } from '@/components/ui/button';
import PurchaseOrdersTable from '@/features/purchase-orders/components/purchase-orders-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const PurchaseOrdersPage = () => {
  return (
    <div className="w-full" data-testid="requirements-page">
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild>
          <Link href={'/purchase-orders/create'}>
            <Plus /> Add new PO
          </Link>
        </Button>
      </div>
      <div>
        <PurchaseOrdersTable />
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;
