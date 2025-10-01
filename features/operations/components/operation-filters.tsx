'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { PROCESS_TYPES, WORK_CENTER_TYPES } from '../schemas';

interface OperationFiltersProps {
  processFilter?: string;
  workCenterFilter?: string;
  onProcessFilterChange: (value?: string) => void;
  onWorkCenterFilterChange: (value?: string) => void;
}

export function OperationFilters({
  processFilter,
  workCenterFilter,
  onProcessFilterChange,
  onWorkCenterFilterChange,
}: OperationFiltersProps) {
  const hasActiveFilters = processFilter || workCenterFilter;

  const handleClearFilters = () => {
    onProcessFilterChange(undefined);
    onWorkCenterFilterChange(undefined);
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Process Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">
          Process
        </label>
        <Select value={processFilter || 'all'} onValueChange={(value) => 
          onProcessFilterChange(value === 'all' ? undefined : value)
        }>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All processes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All processes</SelectItem>
            {PROCESS_TYPES.map((process) => (
              <SelectItem key={process} value={process}>
                {process}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Work Center Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">
          Work Center
        </label>
        <Select value={workCenterFilter || 'all'} onValueChange={(value) => 
          onWorkCenterFilterChange(value === 'all' ? undefined : value)
        }>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All work centers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All work centers</SelectItem>
            {WORK_CENTER_TYPES.map((workCenter) => (
              <SelectItem key={workCenter} value={workCenter}>
                {workCenter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex flex-col gap-1">
          <div className="h-6" /> {/* Spacer for alignment */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-10"
          >
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}