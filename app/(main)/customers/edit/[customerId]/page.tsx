import { CreateCustomerForm } from '@/features/customers/components/create-customer-form';
import React, { use } from 'react';

interface EditCustomerPageProps {
  params: Promise<{ customerId: string }>;
}

const EditCustomerPage = ({ params }: EditCustomerPageProps) => {
  const { customerId } = use(params);

  return (
    <div>
      <CreateCustomerForm customerId={customerId} />
    </div>
  );
};

export default EditCustomerPage;
