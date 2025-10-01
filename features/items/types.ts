// Item API response types
import { Item } from './schemas';

export interface GetItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddItemResponse {
  message: string;
  success: boolean;
  itemCode: string;
}

export interface EditItemResponse {
  message: string;
  success: boolean;
}

export interface GetItemDetailsResponse {
  item: Item;
}
