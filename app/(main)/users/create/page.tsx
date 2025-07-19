import UserForm from '@/features/users/components/user-form';
import React from 'react';

const CreateUserPage = () => {
  return (
    <div className="w-full" data-testid="create-user-page">
      <UserForm mode="create" />
    </div>
  );
};

export default CreateUserPage;
