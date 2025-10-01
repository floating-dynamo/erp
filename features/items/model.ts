import mongoose, { Schema, model } from 'mongoose';

// Define the Item schema
const ItemSchema = new Schema({
  itemCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    optional: true,
  },
  subcategory: {
    type: String,
    optional: true,
  },
  uom: {
    type: String,
    required: true,
  },
  standardRate: {
    type: Number,
    optional: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  materialConsideration: {
    type: String,
    optional: true,
  },
  specifications: {
    type: String,
    optional: true,
  },
  manufacturer: {
    type: String,
    optional: true,
  },
  partNumber: {
    type: String,
    optional: true,
  },
  hsn: {
    type: String,
    optional: true,
  },
  remarks: {
    type: String,
    optional: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    optional: true,
  },
}, {
  timestamps: true,
});

// Create indexes for better performance
ItemSchema.index({ itemCode: 1 });
ItemSchema.index({ itemDescription: 'text' });
ItemSchema.index({ category: 1 });
ItemSchema.index({ isActive: 1 });

// Item model methods
class ItemModel {
  // Get all items with filtering and pagination
  static async getItems({
    page = 1,
    limit = 10,
    searchQuery = '',
    categoryFilter = '',
    isActiveFilter = true,
  } = {}) {
    const filter: Record<string, unknown> = {};
    
    if (isActiveFilter !== undefined) {
      filter.isActive = isActiveFilter;
    }
    
    if (categoryFilter) {
      filter.category = categoryFilter;
    }

    if (searchQuery) {
      filter.$or = [
        { itemCode: { $regex: searchQuery, $options: 'i' } },
        { itemDescription: { $regex: searchQuery, $options: 'i' } },
        { manufacturer: { $regex: searchQuery, $options: 'i' } },
        { partNumber: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const totalItems = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      items,
      total: totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  // Get item by ID
  static async getItemById(id: string) {
    return await Item.findById(id).lean();
  }

  // Get item by item code
  static async getItemByCode(itemCode: string) {
    return await Item.findOne({ itemCode }).lean();
  }

  // Get multiple items by IDs
  static async getItemsByIds(ids: string[]) {
    return await Item.find({ _id: { $in: ids } }).lean();
  }

  // Create new item
  static async createItem(itemData: Record<string, unknown>) {
    const item = new Item(itemData);
    return await item.save();
  }

  // Update item
  static async updateItem(id: string, updateData: Record<string, unknown>) {
    return await Item.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();
  }

  // Delete item (soft delete)
  static async deleteItem(id: string) {
    return await Item.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).lean();
  }

  // Hard delete item
  static async hardDeleteItem(id: string) {
    return await Item.findByIdAndDelete(id);
  }

  // Get categories
  static async getCategories() {
    return await Item.distinct('category', { isActive: true });
  }

  // Get subcategories by category
  static async getSubcategories(category?: string) {
    const filter: Record<string, unknown> = { isActive: true };
    if (category) {
      filter.category = category;
    }
    return await Item.distinct('subcategory', filter);
  }
}

// Create the model
const Item = mongoose.models.Item || model('Item', ItemSchema);

export default ItemModel;
export { Item };
