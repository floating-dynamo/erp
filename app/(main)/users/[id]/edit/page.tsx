import CreateUserForm from '@/features/users/components/create-user-form';
import React from 'react';

interface EditUserPageProps {
  params: {
    id: string;
  };
}

const EditUserPage = ({ params }: EditUserPageProps) => {
  return (
    <div className="w-full" data-testid="edit-user-page">
      <CreateUserForm userId={params.id} mode="edit" />
    </div>
  );
};

export default EditUserPage;
