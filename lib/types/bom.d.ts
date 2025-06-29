import { Bom } from "@/features/bom/schemas";

export interface GetBomsResponse {
  boms: Bom[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddBomResponse {
  message: string;
  success: boolean;
  bomNumber: string;
}

export interface EditBomResponse {
  message: string;
  success: boolean;
}