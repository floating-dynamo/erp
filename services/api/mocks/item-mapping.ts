import { ITEMS_MOCK_DATA } from './items';

// Create a mapping from itemCode to item ID for migration
export const ITEM_CODE_TO_ID_MAPPING = new Map(
  ITEMS_MOCK_DATA.map(item => [item.itemCode, item.id])
);

// Create a mapping from item ID to item for quick lookup
export const ITEMS_BY_ID = new Map(
  ITEMS_MOCK_DATA.map(item => [item.id!, item])
);

/**
 * Helper function to convert old item structure to new item reference structure
 */
export function convertItemToReference(
  oldItem: { itemCode?: number; itemDescription: string; quantity: number },
  overrides: { rate?: number; amount?: number; remarks?: string } = {}
) {
  const itemId = ITEM_CODE_TO_ID_MAPPING.get(oldItem.itemCode?.toString() || '');
  
  if (!itemId) {
    console.warn(`Item ID not found for itemCode: ${oldItem.itemCode}`);
    return {
      itemId: `unknown-${oldItem.itemCode}`,
      quantity: oldItem.quantity,
      rate: overrides.rate,
      amount: overrides.amount,
      remarks: overrides.remarks,
      // Keep backward compatibility
      itemCode: oldItem.itemCode,
      itemDescription: oldItem.itemDescription,
    };
  }

  const item = ITEMS_BY_ID.get(itemId);
  
  return {
    itemId,
    quantity: oldItem.quantity,
    rate: overrides.rate || item?.standardRate || 0,
    amount: overrides.amount || (oldItem.quantity * (overrides.rate || item?.standardRate || 0)),
    remarks: overrides.remarks,
    // Keep backward compatibility
    itemCode: oldItem.itemCode,
    itemDescription: oldItem.itemDescription,
  };
}
