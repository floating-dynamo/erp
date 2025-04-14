'use client';
import { CreateEnquiryForm } from '@/features/enquiries/components/create-enquiry-form';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import React from 'react';

const CreateRequirementsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full lg:max-w-4xl">
        <CreateEnquiryForm
          onCancel={() => {
            redirect('/enquiries');
          }}
        />
      </div>
    </Suspense>
  );
};

export default CreateRequirementsPage;
