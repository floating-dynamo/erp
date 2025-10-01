import { CreateOperationForm } from '@/features/operations/components/create-operation-form';
import React from 'react';

interface EditOperationPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditOperationPage = async ({ params }: EditOperationPageProps) => {
  const { id } = await params;
  
  return (
    <div className="w-full" data-testid="edit-operation-page">
      <CreateOperationForm 
        operationId={id} 
        showBackButton={true} 
      />
    </div>
  );
};

export default EditOperationPage;