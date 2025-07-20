import { UseFormReturn, FieldValues } from 'react-hook-form';

/**
 * MongoDB filter interface for BOM queries
 */
export interface BomFilter {
  productName?: string;
  bomType?: string;
  status?: string;
  bomName?: string;
  totalMaterialCost?: {
    $gte?: number;
    $lte?: number;
  };
  isLatestVersion?: boolean;
}

/**
 * BOM query parameters for API requests
 */
export interface BomQueryParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  productNameFilter?: string;
  bomTypeFilter?: string;
  statusFilter?: string;
  costFrom?: string;
  costTo?: string;
}

/**
 * BOM API response interfaces
 */
export interface BomListResponse {
  boms: import('./schemas').Bom[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BomCreateResponse {
  message: string;
  success: boolean;
  bomNumber: string;
}

export interface BomUpdateResponse {
  message: string;
  success: boolean;
}

/**
 * BOM form interfaces
 */
export interface BomFormData {
  bomName: string;
  productName: string;
  productCode: string;
  version?: string;
  bomType: 'MANUFACTURING' | 'ENGINEERING' | 'SALES' | 'SERVICE';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  items: BomItemFormData[];
  description?: string;
  notes?: string;
  // Version control fields
  baseId?: string;
  parentVersionId?: string;
  isLatestVersion?: boolean;
  changeDescription?: string;
}

/**
 * Version history entry interface
 */
export interface BomVersionHistoryEntry {
  versionNumber: string;
  bomId: string;
  createdAt: Date;
  createdBy: string;
  changeDescription?: string;
}

/**
 * BOM create/update response interfaces
 */
export interface BomCreateResponse {
  message: string;
  success: boolean;
  bomNumber: string;
  id: string;
  version: string;
}

export interface BomUpdateResponse {
  message: string;
  success: boolean;
  newVersion: string;
  newVersionId: string;
}

/**
 * BOM versions response interface
 */
export interface BomVersionsResponse {
  versions: import('./schemas').Bom[];
  total: number;
}

/**
 * BOM version history response interface
 */
export interface BomVersionHistoryResponse {
  versionHistory: BomVersionHistoryEntry[];
  currentVersion: string;
  isLatestVersion: boolean;
}

export interface BomItemFormData {
  itemCode: number;
  itemDescription: string;
  materialConsideration?: string;
  quantity: number;
  uom?: string;
  rate: number;
  currency?: string;
  amount: number;
  remarks?: string;
  level: number;
  parentId?: string;
  children?: BomItemFormData[];
}

/**
 * BOM table interfaces
 */
export interface BomTableRow {
  id: string;
  bomNumber: string;
  bomName: string;
  productName: string;
  productCode: string;
  bomType: string;
  status: string;
  version: string;
  totalMaterialCost: number;
  bomDate?: string;
  createdBy?: string;
  // Version control fields
  baseId?: string;
  parentVersionId?: string;
  isLatestVersion?: boolean;
}

/**
 * BOM hierarchy interfaces
 */
export interface BomHierarchyItem {
  itemCode: number;
  itemDescription: string;
  materialConsideration?: string;
  quantity: number;
  uom?: string;
  rate: number;
  currency?: string;
  amount: number;
  remarks?: string;
  level: number;
  parentId?: string;
  children: BomHierarchyItem[];
  isExpanded?: boolean;
  hasChildren?: boolean;
}

/**
 * BOM statistics interfaces
 */
export interface BomStats {
  totalBoms: number;
  activeBoms: number;
  draftBoms: number;
  totalItemsCount: number;
  averageCost: number;
}

/**
 * BOM validation interfaces
 */
export interface BomValidationError {
  field: string;
  message: string;
  path?: string;
}

export interface BomValidationResult {
  isValid: boolean;
  errors: BomValidationError[];
}

/**
 * BOM search interfaces
 */
export interface BomSearchOptions {
  keys: string[];
  threshold: number;
  includeScore?: boolean;
  ignoreLocation?: boolean;
}

export interface BomSearchResult {
  item: import('./schemas').Bom;
  score?: number;
}

/**
 * BOM export interfaces
 */
export interface BomExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeHierarchy: boolean;
  includeAmounts: boolean;
  fileName?: string;
}

export interface BomExportData {
  headers: string[];
  rows: (string | number)[][];
  metadata: {
    exportedAt: Date;
    totalRecords: number;
    bomNumber: string;
  };
}

/**
 * BOM component props interfaces
 */
export interface BomTableProps {
  data?: BomListResponse;
  isLoading?: boolean;
  onRefresh?: () => void;
  onBomSelect?: (bomId: string) => void;
}

export interface BomFormProps {
  bomId?: string;
  initialData?: BomFormData;
  onSubmit?: (data: BomFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface BomDetailsProps {
  bomId: string;
  bom?: import('./schemas').Bom;
  isLoading?: boolean;
  onEdit?: (bomId: string) => void;
  onDelete?: (bomId: string) => void;
}

export interface HierarchicalItemDisplayProps {
  item: BomHierarchyItem;
  level?: number;
  isLast?: boolean;
  onItemClick?: (item: BomHierarchyItem) => void;
  onToggleExpand?: (item: BomHierarchyItem) => void;
}

export interface HierarchicalItemFormProps<T extends FieldValues = FieldValues> {
  itemIndex: number;
  parentPath?: string;
  level?: number;
  form: UseFormReturn<T>;
  onRemove?: () => void;
  canRemove?: boolean;
}

/**
 * BOM utilities interfaces
 */
export interface BomCostCalculation {
  directCost: number;
  indirectCost: number;
  totalCost: number;
  itemCount: number;
  levelBreakdown: Record<number, number>;
}

export interface BomFlattenOptions {
  includeChildren: boolean;
  maxDepth?: number;
  sortBy?: 'level' | 'itemCode' | 'description';
}

/**
 * BOM metadata interfaces
 */
export interface BomMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
  version: string;
  revisionHistory?: BomRevision[];
}

export interface BomRevision {
  version: string;
  changes: string[];
  modifiedBy: string;
  modifiedAt: Date;
  reason?: string;
}

/**
 * BOM filter state interfaces
 */
export interface BomFilterState {
  productNameFilter: string;
  bomTypeFilter: string;
  statusFilter: string;
  costFrom: string;
  costTo: string;
  searchQuery: string;
}

export interface BomSortState {
  field: keyof BomTableRow;
  direction: 'asc' | 'desc';
}

export interface BomPaginationState {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

/**
 * BOM hooks interfaces
 */
export interface UseBomListOptions extends BomQueryParams {
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseBomDetailsOptions {
  id: string;
  enabled?: boolean;
}

export interface UseBomMutationOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Type guards
 */
export const isBomItem = (item: unknown): item is BomHierarchyItem => {
  return item !== null && 
    typeof item === 'object' && 
    'itemCode' in item && 
    'itemDescription' in item &&
    typeof (item as Record<string, unknown>).itemCode === 'number' && 
    typeof (item as Record<string, unknown>).itemDescription === 'string';
};

export const isBomFormData = (data: unknown): data is BomFormData => {
  return data !== null && 
    typeof data === 'object' && 
    'bomName' in data && 
    'productName' in data &&
    typeof (data as Record<string, unknown>).bomName === 'string' && 
    typeof (data as Record<string, unknown>).productName === 'string';
};

/**
 * Utility types
 */
export type BomType = 'MANUFACTURING' | 'ENGINEERING' | 'SALES' | 'SERVICE';
export type BomStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type BomSortField = keyof BomTableRow;
export type BomExportFormat = 'csv' | 'xlsx' | 'pdf';

/**
 * Constants
 */
export const BOM_TYPES: Record<BomType, string> = {
  MANUFACTURING: 'Manufacturing',
  ENGINEERING: 'Engineering',
  SALES: 'Sales',
  SERVICE: 'Service',
} as const;

export const BOM_STATUSES: Record<BomStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ARCHIVED: 'Archived',
} as const;

export const BOM_STATUS_COLORS: Record<BomStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  ACTIVE: 'bg-green-100 text-green-800 hover:bg-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  ARCHIVED: 'bg-red-100 text-red-800 hover:bg-red-200',
} as const;

export const BOM_TYPE_COLORS: Record<BomType, string> = {
  MANUFACTURING: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  ENGINEERING: 'bg-green-100 text-green-800 hover:bg-green-200',
  SALES: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  SERVICE: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
} as const;