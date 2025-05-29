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
import { FilterIcon, ChevronsUpDown, Check, CalendarIcon } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useEnquiries } from '@/features/enquiries/api/use-enquiries';
import { PurchaseOrderFilterFormValues } from '../types';

interface PurchaseOrderFiltersProps {
  onApplyFilters: (filters: PurchaseOrderFilterFormValues) => void;
  currentFilters: PurchaseOrderFilterFormValues;
}

export const PurchaseOrderFilters: React.FC<PurchaseOrderFiltersProps> = ({
  onApplyFilters,
  currentFilters,
}) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(currentFilters);
  const [enquirySelectOpen, setEnquirySelectOpen] = React.useState(false);
  const [deliveryDateFromOpen, setDeliveryDateFromOpen] = React.useState(false);
  const [deliveryDateToOpen, setDeliveryDateToOpen] = React.useState(false);

  // Fetch unique buyer names from purchase orders API
  const { data: enquiriesData } = useEnquiries({ limit: 1000 });
  const enquiries = enquiriesData?.enquiries || [];

  // Get unique buyer names from existing purchase orders for the dropdown
  // Since there's no direct API for buyer names, we'll fetch this through redux state
  // For simplicity, we're allowing free text input for buyer names

  React.useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleApplyFilters = () => {
    // Convert "all" values back to empty strings for the API
    const apiFilters: PurchaseOrderFilterFormValues = {
      buyerNameFilter: localFilters.buyerNameFilter === 'all' ? '' : localFilters.buyerNameFilter,
      enquiryId: localFilters.enquiryId === 'all' ? '' : localFilters.enquiryId,
      deliveryDateFrom: localFilters.deliveryDateFrom,
      deliveryDateTo: localFilters.deliveryDateTo,
      totalValueFrom: localFilters.totalValueFrom,
      totalValueTo: localFilters.totalValueTo,
    };
    onApplyFilters(apiFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: PurchaseOrderFilterFormValues = {
      buyerNameFilter: '',
      enquiryId: 'all',
      deliveryDateFrom: '',
      deliveryDateTo: '',
      totalValueFrom: '',
      totalValueTo: '',
    };
    setLocalFilters(clearedFilters);
    onApplyFilters({
      buyerNameFilter: '',
      enquiryId: '',
      deliveryDateFrom: '',
      deliveryDateTo: '',
      totalValueFrom: '',
      totalValueTo: '',
    });
    setOpen(false);
  };

  const handleEnquiryChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, enquiryId: value }));
    setEnquirySelectOpen(false);
  };

  const getSelectedEnquiryNumber = () => {
    if (!localFilters.enquiryId || localFilters.enquiryId === 'all') {
      return 'All Enquiries';
    }
    const enquiry = enquiries.find(e => e.id === localFilters.enquiryId);
    return enquiry ? enquiry.enquiryNumber : 'Select Enquiry';
  };

  const hasActiveFilters = Object.entries(currentFilters).some(([key, value]) => {
    if (key === 'totalValueFrom' || key === 'totalValueTo' || 
        key === 'deliveryDateFrom' || key === 'deliveryDateTo') {
      return value !== '';
    }
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
          <DialogTitle>Filter Purchase Orders</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="buyerName">Buyer Name</Label>
            <Input
              id="buyerName"
              placeholder="Enter buyer name"
              value={localFilters.buyerNameFilter}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, buyerNameFilter: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Enquiry</Label>
            <Popover open={enquirySelectOpen} onOpenChange={setEnquirySelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    (!localFilters.enquiryId || localFilters.enquiryId === 'all') && 'text-muted-foreground'
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
                            (localFilters.enquiryId === 'all' || !localFilters.enquiryId)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                      {enquiries.map((enquiry) => (
                        <CommandItem
                          key={enquiry.id}
                          value={enquiry.enquiryNumber}
                          onSelect={() => handleEnquiryChange(enquiry.id || '')}
                        >
                          {enquiry.enquiryNumber}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              localFilters.enquiryId === enquiry.id
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
            <Label>Delivery Date Range</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className="w-10">From</Label>
                <Popover open={deliveryDateFromOpen} onOpenChange={setDeliveryDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.deliveryDateFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.deliveryDateFrom ? formatDate(new Date(localFilters.deliveryDateFrom)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.deliveryDateFrom ? new Date(localFilters.deliveryDateFrom) : undefined}
                      onSelect={(date) => {
                        setLocalFilters(prev => ({ 
                          ...prev, 
                          deliveryDateFrom: date ? date.toISOString() : ''
                        }));
                        setDeliveryDateFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="w-10">To</Label>
                <Popover open={deliveryDateToOpen} onOpenChange={setDeliveryDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.deliveryDateTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.deliveryDateTo ? formatDate(new Date(localFilters.deliveryDateTo)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.deliveryDateTo ? new Date(localFilters.deliveryDateTo) : undefined}
                      onSelect={(date) => {
                        setLocalFilters(prev => ({ 
                          ...prev, 
                          deliveryDateTo: date ? date.toISOString() : ''
                        }));
                        setDeliveryDateToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Total Value Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="From"
                value={localFilters.totalValueFrom}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, totalValueFrom: e.target.value }))}
                className="w-full"
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="To"
                value={localFilters.totalValueTo}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, totalValueTo: e.target.value }))}
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