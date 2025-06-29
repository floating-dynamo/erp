'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BomsTable from '@/features/bom/components/bom-table';
import Link from 'next/link';

export default function BomsPage() {
  return (
    <div className='w-full' data-testid='customers-page'>
      <div className='absolute right-4 top-4 flex gap-2'>
        <Button asChild>
          <Link href={'/boms/create'}>
            <Plus /> Add new BOM
          </Link>
        </Button>
      </div>
      <div>
        <BomsTable />
      </div>
    </div>
  );
}
