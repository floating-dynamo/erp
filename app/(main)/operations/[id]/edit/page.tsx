import { CreateOperationForm } from '@/features/operations/components/create-operation-form';
import React from 'react';

interface EditOperationPageProps {
  params: {
    id: string;
  };
}

const EditOperationPage = ({ params }: EditOperationPageProps) => {
  return (
    <div className="w-full" data-testid="edit-operation-page">
      <CreateOperationForm 
        operationId={params.id} 
        showBackButton={true} 
      />
    </div>
  );
};

export default EditOperationPage;