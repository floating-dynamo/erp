import { Operation } from './schemas';

export interface AddOperationResponse {
  success: boolean;
  message: string;
  operationId?: string;
}

export interface UpdateOperationResponse {
  success: boolean;
  message: string;
  operationId?: string;
}

export interface DeleteOperationResponse {
  success: boolean;
  message: string;
}

export interface OperationListResponse {
  operations: Operation[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface OperationDetailsResponse {
  success: boolean;
  operation?: Operation;
  message?: string;
}