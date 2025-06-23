'use client';
import React from 'react';
import { CreateUserForm } from '@/features/users/components/create-user-form';

const CreateUserPage = () => {
  return (
    <div className="w-full" data-testid="create-user-page">
      <CreateUserForm />
    </div>
  );
};

export default CreateUserPage;