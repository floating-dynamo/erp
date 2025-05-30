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
import { FilterIcon, ChevronsUpDown, Check } from 'lucide-react';
import { useCountries } from '@/features/customers/api/use-countries';
import { cn } from '@/lib/utils';

interface CustomerFiltersProps {
  onApplyFilters: (filters: {
    country: string;
    state: string;
    city: string;
  }) => void;
  currentFilters: {
    country: string;
    state: string;
    city: string;
  };
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  onApplyFilters,
  currentFilters,
}) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(currentFilters);
  const [countrySelectOpen, setCountrySelectOpen] = React.useState(false);
  const [stateSelectOpen, setStateSelectOpen] = React.useState(false);

  // Fetch countries data
  const { data: countriesData } = useCountries();
  const countries = countriesData?.data || [];

  React.useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // Get states based on selected country
  const selectedCountryData = countries.find(
    (country) => country.country === localFilters.country
  );
  const states = selectedCountryData?.cities || [];

  const handleApplyFilters = () => {
    // Convert "all" values back to empty strings for the API
    const apiFilters = {
      country: localFilters.country === 'all' ? '' : localFilters.country,
      state: localFilters.state === 'all' ? '' : localFilters.state,
      city: localFilters.city === 'all' ? '' : localFilters.city,
    };
    onApplyFilters(apiFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      country: 'all',
      state: 'all',
      city: 'all',
    };
    setLocalFilters(clearedFilters);
    onApplyFilters({
      country: '',
      state: '',
      city: '',
    });
    setOpen(false);
  };

  // Reset state and city when country changes
  const handleCountryChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      country: value,
      state: 'all',
      city: 'all',
    }));
    setCountrySelectOpen(false);
  };

  // Reset city when state changes
  const handleStateChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      state: value,
      city: 'all',
    }));
    setStateSelectOpen(false);
  };

  const hasActiveFilters = Object.entries(currentFilters).some(([, value]) => {
    return value !== '' && value !== 'all';
  });

  const getSelectedCountryName = () => {
    if (!localFilters.country || localFilters.country === 'all') {
      return 'All Countries';
    }
    return localFilters.country;
  };

  const getSelectedStateName = () => {
    if (!localFilters.state || localFilters.state === 'all') {
      return 'All States/Cities';
    }
    return localFilters.state;
  };

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
          <DialogTitle>Filter Customers</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Popover open={countrySelectOpen} onOpenChange={setCountrySelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    (!localFilters.country || localFilters.country === 'all') && 'text-muted-foreground'
                  )}
                >
                  {getSelectedCountryName()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search countries..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => handleCountryChange('all')}
                      >
                        All Countries
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            (localFilters.country === 'all' || !localFilters.country)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                      {countries.map((country) => (
                        <CommandItem
                          key={country.country}
                          value={country.country}
                          onSelect={() => handleCountryChange(country.country)}
                        >
                          {country.country}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              localFilters.country === country.country
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
            <Label htmlFor="state">State/City</Label>
            <Popover open={stateSelectOpen} onOpenChange={setStateSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    (!localFilters.state || localFilters.state === 'all') && 'text-muted-foreground'
                  )}
                  disabled={!localFilters.country || localFilters.country === 'all'}
                >
                  {getSelectedStateName()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search states/cities..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No state/city found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => handleStateChange('all')}
                      >
                        All States/Cities
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            (localFilters.state === 'all' || !localFilters.state)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                      {states.map((state) => (
                        <CommandItem
                          key={state}
                          value={state}
                          onSelect={() => handleStateChange(state)}
                        >
                          {state}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              localFilters.state === state
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