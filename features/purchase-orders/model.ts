import mongoose, { Model, Schema } from 'mongoose';
import { PurchaseOrder } from './schemas';

const PurchoseOrderSchema = new Schema<PurchaseOrder>({
  id: { type: String, required: false },
  basicValue: { type: Number, required: false },
  buyerName: { type: String, required: false },
  currency: { type: String, required: false },
  customerId: { type: String, required: false },
  enquiryId: { type: String, required: false },
  deliveryMonth: { type: String, required: false },
  exRate: { type: Number, required: false },
  items: [
    {
      itemId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 0.01 },
      rate: { type: Number, min: 0 },
      amount: { type: Number, min: 0 },
      remarks: { type: String },
      // Keep for backward compatibility during migration
      itemCode: { type: Number },
      itemDescription: { type: String },
    },
  ],
  deliveryDate: { type: String, required: false },
  poDate: { type: String, required: false },
  poMonth: { type: String, required: false },
  poNumber: { type: String, required: false },
  taxPercentage: { type: Number, required: false },
  taxValue: { type: Number, required: false },
  totalBasicValue: { type: Number, required: false },
  totalValue: { type: Number, required: false },
  typeOfService: { type: String, required: false },
});

const PurchaseOrderModel: Model<PurchaseOrder> =
  mongoose.models.PurchaseOrder ||
  mongoose.model<PurchaseOrder>('PurchaseOrder', PurchoseOrderSchema);

export default PurchaseOrderModel;
