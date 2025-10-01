import { Button } from '@/components/ui/button';
import ItemsTable from '@/features/items/components/items-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const ItemsPage = () => {
  return (
    <div className="w-full" data-testid="items-page">
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild>
          <Link href={'/items/create'}>
            <Plus /> Add new Item
          </Link>
        </Button>
      </div>
      <div>
        <ItemsTable />
      </div>
    </div>
  );
};

export default ItemsPage;