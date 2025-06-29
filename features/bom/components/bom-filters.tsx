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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilterIcon } from 'lucide-react';

interface BomFiltersProps {
  onApplyFilters: (filters: {
    productNameFilter: string;
    bomTypeFilter: string;
    statusFilter: string;
    costFrom: string;
    costTo: string;
  }) => void;
  currentFilters: {
    productNameFilter: string;
    bomTypeFilter: string;
    statusFilter: string;
    costFrom: string;
    costTo: string;
  };
}

export const BomFilters: React.FC<BomFiltersProps> = ({ 
  onApplyFilters, 
  currentFilters 
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
      productNameFilter: '',
      bomTypeFilter: '',
      statusFilter: '',
      costFrom: '',
      costTo: '',
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    setOpen(false);
  };

  const hasActiveFilters = Object.values(currentFilters).some(value => value !== '');

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
          <DialogTitle>Filter BOMs</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="Filter by product name..."
              value={localFilters.productNameFilter}
              onChange={(e) =>
                setLocalFilters(prev => ({ ...prev, productNameFilter: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bomType">BOM Type</Label>
            <Select
              value={localFilters.bomTypeFilter || 'all'}
              onValueChange={(value) =>
                setLocalFilters(prev => ({ ...prev, bomTypeFilter: value === 'all' ? '' : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                <SelectItem value="ENGINEERING">Engineering</SelectItem>
                <SelectItem value="SALES">Sales</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={localFilters.statusFilter || 'all'}
              onValueChange={(value) =>
                setLocalFilters(prev => ({ ...prev, statusFilter: value === 'all' ? '' : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Cost Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="From"
                value={localFilters.costFrom}
                onChange={(e) =>
                  setLocalFilters(prev => ({ ...prev, costFrom: e.target.value }))
                }
                className="w-full"
                min="0"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="To"
                value={localFilters.costTo}
                onChange={(e) =>
                  setLocalFilters(prev => ({ ...prev, costTo: e.target.value }))
                }
                className="w-full"
                min="0"
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