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
import { Label } from '@/components/ui/label';
import { FilterIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ItemFiltersProps {
  onApplyFilters: (filters: {
    categoryFilter: string;
    isActiveFilter: boolean;
  }) => void;
  currentFilters: {
    categoryFilter: string;
    isActiveFilter: boolean;
  };
}

export const ItemFilters: React.FC<ItemFiltersProps> = ({
  onApplyFilters,
  currentFilters,
}) => {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(currentFilters);

  React.useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      categoryFilter: '',
      isActiveFilter: true,
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    setOpen(false);
  };

  const hasActiveFilters = 
    localFilters.categoryFilter !== '' || 
    localFilters.isActiveFilter !== true;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}
        >
          <FilterIcon className="size-4" />
          {hasActiveFilters && <span className="ml-1 text-blue-500">•</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Items</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={localFilters.categoryFilter}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  categoryFilter: value === 'all' ? '' : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Machinery">Machinery</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Materials">Materials</SelectItem>
                <SelectItem value="Components">Components</SelectItem>
                <SelectItem value="Consumables">Consumables</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active-filter"
              checked={localFilters.isActiveFilter}
              onCheckedChange={(checked) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  isActiveFilter: checked,
                }))
              }
            />
            <Label htmlFor="active-filter">Show active items only</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};