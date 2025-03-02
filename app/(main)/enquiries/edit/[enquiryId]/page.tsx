import { CreateEnquiryForm } from '@/features/enquiries/components/create-enquiry-form';
import React, { use } from 'react';

interface EditEnquiryPageProps {
  params: Promise<{ enquiryId: string }>;
}

const EditEnquiryPage = ({ params }: EditEnquiryPageProps) => {
  const { enquiryId } = use(params);

  return (
    <div>
      <CreateEnquiryForm enquiryId={enquiryId} />
    </div>
  );
};

export default EditEnquiryPage;
