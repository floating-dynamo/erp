'use client';

import { CreateCompanyForm } from '@/features/companies/components/create-company-form';
import { redirect } from 'next/navigation';
import React from 'react';

const CreateCompanyPage = () => {
  return (
    <div className="w-full lg:max-w-4xl">
      <CreateCompanyForm
        onCancel={() => {
          redirect('/companies');
        }}
      />
    </div>
  );
};

export default CreateCompanyPage;
