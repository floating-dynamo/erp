'use client';
import React, { Suspense } from 'react';

import { CreateCustomerForm } from '@/features/customers/components/create-customer-form';
import { redirect } from 'next/navigation';

const CreateCustomersPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full lg:max-w-4xl">
        <CreateCustomerForm
          onCancel={() => {
            redirect('/customers');
          }}
        />
      </div>
    </Suspense>
  );
};

export default CreateCustomersPage;
