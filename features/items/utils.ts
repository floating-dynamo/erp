import ItemModel from "./model";
import { Item } from "./schemas";

/**
 * Populate item details for items that have itemId references
 */
export async function populateItemDetails<T extends { items: Array<{ itemId?: string; itemCode?: number; itemDescription?: string }> }>(
  document: T
): Promise<T & { items: Array<T['items'][0] & { itemDetails?: Item }> }> {
  if (!document.items || document.items.length === 0) {
    return document as T & { items: Array<T['items'][0] & { itemDetails?: Item }> };
  }

  const itemIds = document.items
    .filter(item => item.itemId)
    .map(item => item.itemId as string);

  if (itemIds.length === 0) {
    return document as T & { items: Array<T['items'][0] & { itemDetails?: Item }> };
  }

  try {
    const items = await ItemModel.getItemsByIds(itemIds);
    const itemsMap = new Map(items.map((item) => [item._id?.toString() || item.id, item]));

    const populatedItems = document.items.map(item => ({
      ...item,
      itemDetails: item.itemId ? itemsMap.get(item.itemId) : undefined
    }));

    return {
      ...document,
      items: populatedItems
    };
  } catch (error) {
    console.error('Error populating item details:', error);
    return document as T & { items: Array<T['items'][0] & { itemDetails?: Item }> };
  }
}

/**
 * Extract item codes and descriptions for items that have itemId references
 * Used for backward compatibility during migration
 */
export async function backfillItemCodeAndDescription<T extends { items: Array<{ itemId?: string; itemCode?: number; itemDescription?: string }> }>(
  document: T
): Promise<T> {
  if (!document.items || document.items.length === 0) {
    return document;
  }

  const itemsToBackfill = document.items.filter(item => 
    item.itemId && (!item.itemCode || !item.itemDescription)
  );

  if (itemsToBackfill.length === 0) {
    return document;
  }

  try {
    const itemIds = itemsToBackfill.map(item => item.itemId as string);
    const items = await ItemModel.getItemsByIds(itemIds);
    const itemsMap = new Map(items.map((item) => [item._id?.toString() || item.id, item]));

    document.items.forEach((item) => {
      if (item.itemId && itemsMap.has(item.itemId)) {
        const itemDetails = itemsMap.get(item.itemId);
        if (!item.itemCode && itemDetails?.itemCode) {
          item.itemCode = Number(itemDetails.itemCode);
        }
        if (!item.itemDescription && itemDetails?.itemDescription) {
          item.itemDescription = itemDetails.itemDescription;
        }
      }
    });

    return document;
  } catch (error) {
    console.error('Error backfilling item details:', error);
    return document;
  }
}

/**
 * Calculate total amount from items with populated details
 */
export function calculateTotalAmount(items: Array<{ quantity: number; rate?: number; amount?: number; itemDetails?: Item }>): number {
  return items.reduce((total, item) => {
    if (item.amount) {
      return total + item.amount;
    }
    
    const rate = item.rate ?? item.itemDetails?.standardRate ?? 0;
    return total + (item.quantity * rate);
  }, 0);
}
