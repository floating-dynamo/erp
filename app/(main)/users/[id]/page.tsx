'use client';
import React from 'react';
import { UserDetails } from '@/features/users/components/user-details';
import { useParams } from 'next/navigation';

const UserDetailPage = () => {
  const params = useParams();
  const userId = params.id as string;

  return (
    <div className="w-full" data-testid="user-detail-page">
      <UserDetails userId={userId} />
    </div>
  );
};

export default UserDetailPage;