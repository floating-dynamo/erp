import { Operation } from '@/features/operations/schemas';

export interface GetOperationsResponse {
  operations: Operation[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface AddOperationResponse {
  success: boolean;
  message: string;
  operationId?: string;
}

export interface EditOperationResponse {
  success: boolean;
  message: string;
  operationId?: string;
}