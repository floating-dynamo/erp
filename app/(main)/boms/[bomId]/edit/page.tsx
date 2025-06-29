'use client';

import { use } from 'react';
import CreateBomForm from '@/features/bom/components/create-bom-form';

interface EditBomPageProps {
  params: Promise<{ bomId: string }>;
}

export default function EditBomPage({ params }: EditBomPageProps) {
  const { bomId } = use(params);
  return <CreateBomForm bomId={bomId} />;
}