import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, ClipboardXIcon } from 'lucide-react';
import { redirect } from 'next/navigation';

export const EnquiryNotFound = () => {
  function backToEnquiryListing() {
    redirect('/enquiries');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <ClipboardXIcon className="size-12 text-slate-500" />
      <p className="text-muted-foreground text-lg text-center md:text-2xl">
        Enquiry data not found
      </p>
      <Button
        onClick={backToEnquiryListing}
        variant={'outline'}
        className="md:text-lg"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Enquiry Listing
      </Button>
    </div>
  );
};
