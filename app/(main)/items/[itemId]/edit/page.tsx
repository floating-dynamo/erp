'use client';

import { use } from 'react';
import { CreateItemForm } from '@/features/items/components/create-item-form';
import { useRouter } from 'next/navigation';

interface EditItemPageProps {
  params: Promise<{
    itemId: string;
  }>;
}

const EditItemPage = ({ params }: EditItemPageProps) => {
  const router = useRouter();
  const { itemId } = use(params);

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="h-full">
      <CreateItemForm itemId={itemId} onCancel={handleCancel} />
    </div>
  );
};

export default EditItemPage;