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
import { FilterIcon, ChevronsUpDown, Check, CalendarIcon } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useGetCompanies } from '@/features/companies/api/use-get-companies';
import { UserFilterFormValues } from '../types';

interface UserFiltersProps {
  onApplyFilters: (filters: UserFilterFormValues) => void;
  currentFilters: UserFilterFormValues;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  onApplyFilters,
  currentFilters,
}) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(currentFilters);
  const [companySelectOpen, setCompanySelectOpen] = React.useState(false);
  const [lastLoginFromOpen, setLastLoginFromOpen] = React.useState(false);
  const [lastLoginToOpen, setLastLoginToOpen] = React.useState(false);
  const [createdFromOpen, setCreatedFromOpen] = React.useState(false);
  const [createdToOpen, setCreatedToOpen] = React.useState(false);

  // Fetch companies for the company filter
  const { data: companiesData } = useGetCompanies();
  const companies = companiesData || [];

  // Role options
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' },
    { value: 'viewer', label: 'Viewer' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'sales', label: 'Sales' },
    { value: 'purchase', label: 'Purchase' },
  ];

  // Active status options
  const activeStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  React.useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleApplyFilters = () => {
    // Convert "all" values back to empty strings for the API
    const apiFilters: UserFilterFormValues = {
      roleFilter: localFilters.roleFilter === 'all' ? '' : localFilters.roleFilter,
      isActiveFilter: localFilters.isActiveFilter === 'all' ? '' : localFilters.isActiveFilter,
      companyFilter: localFilters.companyFilter === 'all' ? '' : localFilters.companyFilter,
      lastLoginFrom: localFilters.lastLoginFrom,
      lastLoginTo: localFilters.lastLoginTo,
      createdFrom: localFilters.createdFrom,
      createdTo: localFilters.createdTo,
    };
    onApplyFilters(apiFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      roleFilter: 'all',
      isActiveFilter: 'all',
      companyFilter: 'all',
      lastLoginFrom: '',
      lastLoginTo: '',
      createdFrom: '',
      createdTo: '',
    };
    setLocalFilters(clearedFilters);
    onApplyFilters({
      roleFilter: '',
      isActiveFilter: '',
      companyFilter: '',
      lastLoginFrom: '',
      lastLoginTo: '',
      createdFrom: '',
      createdTo: '',
    });
    setOpen(false);
  };

  const getSelectedCompanyName = () => {
    if (!localFilters.companyFilter || localFilters.companyFilter === 'all') {
      return 'All Companies';
    }
    const company = companies.find(c => c.id === localFilters.companyFilter);
    return company ? company.name : 'Select company';
  };

  const getSelectedRoleLabel = () => {
    const role = roleOptions.find(r => r.value === localFilters.roleFilter);
    return role ? role.label : 'All Roles';
  };

  const getSelectedStatusLabel = () => {
    const status = activeStatusOptions.find(s => s.value === localFilters.isActiveFilter);
    return status ? status.label : 'All Status';
  };

  const hasActiveFilters = Object.entries(currentFilters).some(([key, value]) => {
    if (key === 'lastLoginFrom' || key === 'lastLoginTo' || key === 'createdFrom' || key === 'createdTo') {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Users</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    (!localFilters.roleFilter || localFilters.roleFilter === 'all') && 'text-muted-foreground'
                  )}
                >
                  {getSelectedRoleLabel()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search roles..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup>
                      {roleOptions.map((role) => (
                        <CommandItem
                          key={role.value}
                          value={role.label}
                          onSelect={() => setLocalFilters(prev => ({ ...prev, roleFilter: role.value }))}
                        >
                          {role.label}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              localFilters.roleFilter === role.value
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
            <Label>Status</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    (!localFilters.isActiveFilter || localFilters.isActiveFilter === 'all') && 'text-muted-foreground'
                  )}
                >
                  {getSelectedStatusLabel()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search status..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {activeStatusOptions.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.label}
                          onSelect={() => setLocalFilters(prev => ({ ...prev, isActiveFilter: status.value }))}
                        >
                          {status.label}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              localFilters.isActiveFilter === status.value
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
            <Label>Company</Label>
            <Popover open={companySelectOpen} onOpenChange={setCompanySelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    (!localFilters.companyFilter || localFilters.companyFilter === 'all') && 'text-muted-foreground'
                  )}
                >
                  {getSelectedCompanyName()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search companies..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No company found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setLocalFilters(prev => ({ ...prev, companyFilter: 'all' }));
                          setCompanySelectOpen(false);
                        }}
                      >
                        All Companies
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            (localFilters.companyFilter === 'all' || !localFilters.companyFilter)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                      {companies.map((company) => (
                        <CommandItem
                          key={company.id}
                          value={company.name}
                          onSelect={() => {
                            setLocalFilters(prev => ({ ...prev, companyFilter: company.id || '' }));
                            setCompanySelectOpen(false);
                          }}
                        >
                          {company.name}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              localFilters.companyFilter === company.id
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
            <Label>Last Login Date Range</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className="w-10">From</Label>
                <Popover open={lastLoginFromOpen} onOpenChange={setLastLoginFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.lastLoginFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.lastLoginFrom ? formatDate(new Date(localFilters.lastLoginFrom)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.lastLoginFrom ? new Date(localFilters.lastLoginFrom) : undefined}
                      onSelect={(date) => {
                        setLocalFilters(prev => ({ 
                          ...prev, 
                          lastLoginFrom: date ? date.toISOString() : ''
                        }));
                        setLastLoginFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-10">To</Label>
                <Popover open={lastLoginToOpen} onOpenChange={setLastLoginToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.lastLoginTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.lastLoginTo ? formatDate(new Date(localFilters.lastLoginTo)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.lastLoginTo ? new Date(localFilters.lastLoginTo) : undefined}
                      onSelect={(date) => {
                        setLocalFilters(prev => ({ 
                          ...prev, 
                          lastLoginTo: date ? date.toISOString() : ''
                        }));
                        setLastLoginToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Created Date Range</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className="w-10">From</Label>
                <Popover open={createdFromOpen} onOpenChange={setCreatedFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.createdFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.createdFrom ? formatDate(new Date(localFilters.createdFrom)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.createdFrom ? new Date(localFilters.createdFrom) : undefined}
                      onSelect={(date) => {
                        setLocalFilters(prev => ({ 
                          ...prev, 
                          createdFrom: date ? date.toISOString() : ''
                        }));
                        setCreatedFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-10">To</Label>
                <Popover open={createdToOpen} onOpenChange={setCreatedToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.createdTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.createdTo ? formatDate(new Date(localFilters.createdTo)) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.createdTo ? new Date(localFilters.createdTo) : undefined}
                      onSelect={(date) => {
                        setLocalFilters(prev => ({ 
                          ...prev, 
                          createdTo: date ? date.toISOString() : ''
                        }));
                        setCreatedToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
