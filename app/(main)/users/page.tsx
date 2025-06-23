import { Button } from '@/components/ui/button';
import { UsersTable } from '@/features/users/components/users-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const UsersPage = () => {
  return (
    <div className="w-full" data-testid="users-page">
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild>
          <Link href={'/users/create'}>
            <Plus /> Add new User
          </Link>
        </Button>
      </div>
      <div>
        <UsersTable />
      </div>
    </div>
  );
};

export default UsersPage;