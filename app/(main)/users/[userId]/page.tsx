import UserDetails from '@/features/users/components/user-details';
import React, { use } from 'react';

interface UserDetailsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

const UserDetailsPage = ({ params }: UserDetailsPageProps) => {
  const { userId } = use(params);
  return (
    <div className="w-full" data-testid="user-details-page">
      <UserDetails userId={userId} />
    </div>
  );
};

export default UserDetailsPage;
