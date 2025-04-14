import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, UserRoundXIcon } from 'lucide-react';
import { redirect } from 'next/navigation';

export const CustomerNotFound = () => {
  function backToCustomerListing() {
    redirect('/customers');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <UserRoundXIcon className="size-12 text-slate-500" />
      <p className="text-muted-foreground text-lg text-center md:text-2xl">
        Customer data not found
      </p>
      <Button
        onClick={backToCustomerListing}
        variant={'outline'}
        className="md:text-lg"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Customer Listing
      </Button>
    </div>
  );
};
