'use client';

import { CreateCompanyForm } from '@/features/companies/components/create-company-form';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';

const CreateCompanyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full lg:max-w-4xl">
        <CreateCompanyForm
          onCancel={() => {
            redirect('/companies');
          }}
        />
      </div>
    </Suspense>
  );
};

export default CreateCompanyPage;
