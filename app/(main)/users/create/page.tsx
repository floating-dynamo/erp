import CreateUserForm from '@/features/users/components/create-user-form';
import React from 'react';

const CreateUserPage = () => {
  return (
    <div className="w-full" data-testid="create-user-page">
      <CreateUserForm mode="create" />
    </div>
  );
};

export default CreateUserPage;
