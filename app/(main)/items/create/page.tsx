'use client';

import { CreateItemForm } from '@/features/items/components/create-item-form';
import { useRouter } from 'next/navigation';

const CreateItemPage = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="h-full">
      <CreateItemForm onCancel={handleCancel} />
    </div>
  );
};

export default CreateItemPage;