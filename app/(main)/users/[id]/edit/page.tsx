'use client';

import { CreateUserForm } from '@/features/users/components/create-user-form';
import { useParams } from 'next/navigation';

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <div className="container mx-auto py-6">
      <CreateUserForm userId={userId} />
    </div>
  );
}