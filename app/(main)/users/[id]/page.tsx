import UserDetails from '@/features/users/components/user-details';
import React from 'react';

interface UserDetailsPageProps {
  params: {
    id: string;
  };
}

const UserDetailsPage = ({ params }: UserDetailsPageProps) => {
  return (
    <div className="w-full" data-testid="user-details-page">
      <UserDetails userId={params.id} />
    </div>
  );
};

export default UserDetailsPage;
