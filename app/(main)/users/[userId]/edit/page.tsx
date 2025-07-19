import CreateUserForm from '@/features/users/components/create-user-form';
import React, { use } from 'react';

interface EditUserPageProps {
  params: Promise<{ userId: string }>;
}

const EditUserPage = ({ params }: EditUserPageProps) => {
  const { userId } = use(params);
  return (
    <div className="w-full" data-testid="edit-user-page">
      <CreateUserForm userId={userId} mode="edit" />
    </div>
  );
};

export default EditUserPage;
