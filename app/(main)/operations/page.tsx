'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OperationsTable } from '@/features/operations/components/operations-table';
import { OperationFilters } from '@/features/operations/components/operation-filters';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

const OperationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [processFilter, setProcessFilter] = useState<string | undefined>();
  const [workCenterFilter, setWorkCenterFilter] = useState<string | undefined>();

  return (
    <div className="w-full space-y-6" data-testid="operations-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations</h1>
          <p className="text-muted-foreground">
            Manage your manufacturing operations and processes
          </p>
        </div>
        <Button asChild>
          <Link href="/operations/create">
            <Plus className="mr-2 h-4 w-4" />
            Add New Operation
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search operations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <OperationFilters
          processFilter={processFilter}
          workCenterFilter={workCenterFilter}
          onProcessFilterChange={setProcessFilter}
          onWorkCenterFilterChange={setWorkCenterFilter}
        />
      </div>

      {/* Operations Table */}
      <OperationsTable
        searchQuery={searchQuery}
        processFilter={processFilter}
        workCenterFilter={workCenterFilter}
      />
    </div>
  );
};

export default OperationsPage;