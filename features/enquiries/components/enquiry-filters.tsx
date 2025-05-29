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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { FilterIcon, CalendarIcon } from 'lucide-react';
import { useCustomers } from '@/features/customers/api/use-customers';
import { cn, formatDate } from '@/lib/utils';

interface EnquiryFiltersProps {
  onApplyFilters: (filters: {
    customerFilter: string;
    dueDateFrom: string;
    dueDateTo: string;
    quotationCreated: string;
  }) => void;
  currentFilters: {
    customerFilter: string;
    dueDateFrom: string;
    dueDateTo: string;
    quotationCreated: string;
  };
}

export const EnquiryFilters: React.FC<EnquiryFiltersProps> = ({
  onApplyFilters,
  currentFilters,
}) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(currentFilters);

  // State for controlling date picker popovers
  const [isFromDateOpen, setIsFromDateOpen] = React.useState(false);
  const [isToDateOpen, setIsToDateOpen] = React.useState(false);

  // Fetch customers for the dropdown
  const { data: customersData } = useCustomers({ limit: 1000 });
  const customers = customersData?.customers || [];

  React.useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleApplyFilters = () => {
    // Convert "all" values back to empty strings for the API
    const apiFilters = {
      customerFilter: localFilters.customerFilter === 'all' ? '' : localFilters.customerFilter,
      dueDateFrom: localFilters.dueDateFrom,
      dueDateTo: localFilters.dueDateTo,
      quotationCreated: localFilters.quotationCreated === 'all' ? '' : localFilters.quotationCreated,
    };
    onApplyFilters(apiFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      customerFilter: 'all',
      dueDateFrom: '',
      dueDateTo: '',
      quotationCreated: 'all',
    };
    setLocalFilters(clearedFilters);
    onApplyFilters({
      customerFilter: '',
      dueDateFrom: '',
      dueDateTo: '',
      quotationCreated: '',
    });
    setOpen(false);
  };

  const hasActiveFilters = Object.entries(currentFilters).some(([key, value]) => {
    if (key === 'dueDateFrom' || key === 'dueDateTo') return value !== '';
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
          <DialogTitle>Filter Enquiries</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={localFilters.customerFilter || 'all'}
              onValueChange={(value) =>
                setLocalFilters(prev => ({ ...prev, customerFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Quotation Due Date From</Label>
            <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left',
                    !localFilters.dueDateFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dueDateFrom
                    ? formatDate(new Date(localFilters.dueDateFrom))
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={
                    localFilters.dueDateFrom ? new Date(localFilters.dueDateFrom) : undefined
                  }
                  onSelect={(date) => {
                    const selectedDate = date ? date.toISOString() : '';
                    setLocalFilters(prev => ({ ...prev, dueDateFrom: selectedDate }));
                    setIsFromDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Quotation Due Date To</Label>
            <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left',
                    !localFilters.dueDateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dueDateTo
                    ? formatDate(new Date(localFilters.dueDateTo))
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={
                    localFilters.dueDateTo ? new Date(localFilters.dueDateTo) : undefined
                  }
                  onSelect={(date) => {
                    const selectedDate = date ? date.toISOString() : '';
                    setLocalFilters(prev => ({ ...prev, dueDateTo: selectedDate }));
                    setIsToDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quotationCreated">Quotation Created</Label>
            <Select
              value={localFilters.quotationCreated || 'all'}
              onValueChange={(value) =>
                setLocalFilters(prev => ({ ...prev, quotationCreated: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
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