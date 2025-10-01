import { NextRequest } from 'next/server';
import { z } from 'zod';
import ItemModel from '../model';
import { createItemSchema, updateItemSchema } from '../schemas';
import { AddItemResponse } from '../types';

/**
 * Create a new item
 */
export async function createItem(
  data: z.infer<typeof createItemSchema>
): Promise<AddItemResponse> {
  try {
    // Validate input data
    const validatedData = createItemSchema.parse(data);
    
    // Check if item code already exists
    const existingItem = await ItemModel.getItemByCode(validatedData.itemCode);
    if (existingItem) {
      return {
        success: false,
        message: `Item with code ${validatedData.itemCode} already exists`,
        itemCode: validatedData.itemCode,
      };
    }

    // Create the item
    const item = await ItemModel.createItem(validatedData);
    
    return {
      success: true,
      message: 'Item created successfully',
      itemCode: item.itemCode,
    };
  } catch (error) {
    console.error('Error creating item:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation error',
        itemCode: data.itemCode || '',
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create item',
      itemCode: data.itemCode || '',
    };
  }
}

/**
 * Get all items with optional filtering
 */
export async function getItems(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isActive = searchParams.get('isActive');
    
    const result = await ItemModel.getItems({
      page,
      limit,
      searchQuery: search,
      categoryFilter: category,
      isActiveFilter: isActive !== null ? isActive === 'true' : true,
    });
    
    return {
      success: true,
      message: 'Items retrieved successfully',
      ...result,
    };
  } catch (error) {
    console.error('Error getting items:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get items',
    };
  }
}

/**
 * Get a single item by ID
 */
export async function getItemById(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        message: 'Item ID is required',
      };
    }
    
    const item = await ItemModel.getItemById(id);
    
    if (!item) {
      return {
        success: false,
        message: 'Item not found',
      };
    }
    
    return {
      success: true,
      message: 'Item retrieved successfully',
      data: item,
    };
  } catch (error) {
    console.error('Error getting item by ID:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get item',
    };
  }
}

/**
 * Update an existing item
 */
export async function updateItem(id: string, data: z.infer<typeof updateItemSchema>) {
  try {
    if (!id) {
      return {
        success: false,
        message: 'Item ID is required',
      };
    }
    
    // Validate input data
    const validatedData = updateItemSchema.parse(data);
    
    // Check if updating item code to one that already exists
    if (validatedData.itemCode) {
      const existingItem = await ItemModel.getItemByCode(validatedData.itemCode);
      if (existingItem && (existingItem as Record<string, unknown>)._id?.toString() !== id) {
        return {
          success: false,
          message: `Item with code ${validatedData.itemCode} already exists`,
        };
      }
    }
    
    const updatedItem = await ItemModel.updateItem(id, validatedData);
    
    if (!updatedItem) {
      return {
        success: false,
        message: 'Item not found',
      };
    }
    
    return {
      success: true,
      message: 'Item updated successfully',
    };
  } catch (error) {
    console.error('Error updating item:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation error',
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update item',
    };
  }
}

/**
 * Delete an item (soft delete by setting isActive to false)
 */
export async function deleteItem(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        message: 'Item ID is required',
      };
    }
    
    const deletedItem = await ItemModel.deleteItem(id);
    
    if (!deletedItem) {
      return {
        success: false,
        message: 'Item not found',
      };
    }
    
    return {
      success: true,
      message: 'Item deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete item',
    };
  }
}

/**
 * Get items by IDs (for bulk operations)
 */
export async function getItemsByIds(itemIds: string[]) {
  try {
    if (!itemIds || itemIds.length === 0) {
      return {
        success: false,
        message: 'Item IDs are required',
      };
    }
    
    const items = await ItemModel.getItemsByIds(itemIds);
    
    return {
      success: true,
      message: 'Items retrieved successfully',
      data: items,
    };
  } catch (error) {
    console.error('Error getting items by IDs:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get items',
    };
  }
}

/**
 * Get distinct categories
 */
export async function getItemCategories() {
  try {
    const categories = await ItemModel.getCategories();
    
    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    };
  } catch (error) {
    console.error('Error getting categories:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get categories',
    };
  }
}

/**
 * Get item by code
 */
export async function getItemByCode(itemCode: string) {
  try {
    if (!itemCode) {
      return {
        success: false,
        message: 'Item code is required',
      };
    }
    
    const item = await ItemModel.getItemByCode(itemCode);
    
    if (!item) {
      return {
        success: false,
        message: 'Item not found',
      };
    }
    
    return {
      success: true,
      message: 'Item retrieved successfully',
      data: item,
    };
  } catch (error) {
    console.error('Error getting item by code:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get item',
    };
  }
}
