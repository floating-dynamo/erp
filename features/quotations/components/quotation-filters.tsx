import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FilterIcon, ChevronsUpDown, Check } from 'lucide-react';
import { useCustomers } from '@/features/customers/api/use-customers';
import { cn } from '@/lib/utils';
import { useEnquiries } from '@/features/enquiries/api/use-enquiries';

interface QuotationFiltersProps {
  onApplyFilters: (filters: {
    customerFilter: string;
    enquiryNumberFilter: string;
    amountFrom: string;
    amountTo: string;
  }) => void;
  currentFilters: {
    customerFilter: string;
    enquiryNumberFilter: string;
    amountFrom: string;
    amountTo: string;
  };
}

export const QuotationFilters: React.FC<QuotationFiltersProps> = ({
  onApplyFilters,
  currentFilters,
}) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(currentFilters);
  const [customerSelectOpen, setCustomerSelectOpen] = React.useState(false);
  const [enquirySelectOpen, setEnquirySelectOpen] = React.useState(false);

  // Fetch customers for the dropdown
  const { data: customersData } = useCustomers({ limit: 1000 });
  const customers = customersData?.customers || [];

  // Fetch enquiries for the dropdown
  const { data: enquiriesData } = useEnquiries({ limit: 1000 });
  const enquiries = enquiriesData?.enquiries || [];

  React.useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleApplyFilters = () => {
    // Convert "all" values back to empty strings for the API
    const apiFilters = {
      customerFilter: localFilters.customerFilter === 'all' ? '' : localFilters.customerFilter,
      enquiryNumberFilter: localFilters.enquiryNumberFilter === 'all' ? '' : localFilters.enquiryNumberFilter,
      amountFrom: localFilters.amountFrom,
      amountTo: localFilters.amountTo,
    };
    onApplyFilters(apiFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      customerFilter: 'all',
      enquiryNumberFilter: 'all',
      amountFrom: '',
      amountTo: '',
    };
    setLocalFilters(clearedFilters);
    onApplyFilters({
      customerFilter: '',
      enquiryNumberFilter: '',
      amountFrom: '',
      amountTo: '',
    });
    setOpen(false);
  };

  const handleCustomerChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, customerFilter: value }));
    setCustomerSelectOpen(false);
  };

  const handleEnquiryChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, enquiryNumberFilter: value }));
    setEnquirySelectOpen(false);
  };

  const getSelectedCustomerName = () => {
    if (!localFilters.customerFilter || localFilters.customerFilter === 'all') {
      return 'All Customers';
    }
    const customer = customers.find(c => c.id === localFilters.customerFilter);
    return customer ? customer.name : 'Select customer';
  };

  const getSelectedEnquiryNumber = () => {
    if (!localFilters.enquiryNumberFilter || localFilters.enquiryNumberFilter === 'all') {
      return 'All Enquiries';
    }
    return localFilters.enquiryNumberFilter;
  };

  const hasActiveFilters = Object.entries(currentFilters).some(([key, value]) => {
    if (key === 'amountFrom' || key === 'amountTo') return value !== '';
    return value !== '' && value !== 'all';
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}>
          <FilterIcon className="size-4" />
          {hasActiveFilters && <span className="ml-1 text-blue-500">•</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Quotations</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer</Label>
            <Popover open={customerSelectOpen} onOpenChange={setCustomerSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    (!localFilters.customerFilter || localFilters.customerFilter === 'all') && 'text-muted-foreground'
                  )}
                >
                  {getSelectedCustomerName()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search customers..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => handleCustomerChange('all')}
                      >
                        All Customers
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            (localFilters.customerFilter === 'all' || !localFilters.customerFilter)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.name}
                          onSelect={() => handleCustomerChange(customer.id)}
                        >
                          {customer.name}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              localFilters.customerFilter === customer.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Enquiry Number</Label>
            <Popover open={enquirySelectOpen} onOpenChange={setEnquirySelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    (!localFilters.enquiryNumberFilter || localFilters.enquiryNumberFilter === 'all') && 'text-muted-foreground'
                  )}
                >
                  {getSelectedEnquiryNumber()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search enquiries..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No enquiry found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => handleEnquiryChange('all')}
                      >
                        All Enquiries
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            (localFilters.enquiryNumberFilter === 'all' || !localFilters.enquiryNumberFilter)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                      {enquiries.map((enquiry) => (
                        <CommandItem
                          key={enquiry.id}
                          value={enquiry.enquiryNumber}
                          onSelect={() => handleEnquiryChange(enquiry.enquiryNumber)}
                        >
                          {enquiry.enquiryNumber}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              localFilters.enquiryNumberFilter === enquiry.enquiryNumber
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Amount Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="From"
                value={localFilters.amountFrom}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, amountFrom: e.target.value }))}
                className="w-full"
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="To"
                value={localFilters.amountTo}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, amountTo: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};