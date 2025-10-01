import { CreateOperationForm } from '@/features/operations/components/create-operation-form';
import React from 'react';

const CreateOperationPage = () => {
  return (
    <div className="w-full" data-testid="create-operation-page">
      <CreateOperationForm showBackButton={true} />
    </div>
  );
};

export default CreateOperationPage;