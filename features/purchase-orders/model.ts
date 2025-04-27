import mongoose, { Model, Schema } from 'mongoose';
import { PurchaseOrder } from './schemas';

const PurchoseOrderSchema = new Schema<PurchaseOrder>({
  id: { type: String, required: false },
  basicValue: { type: Number, required: false },
  buyerName: { type: String, required: false },
  currency: { type: String, required: false },
  customerId: { type: String, required: false },
  deliveryMonth: { type: String, required: false },
  exRate: { type: Number, required: false },
  items: [
    {
      itemCode: { type: Number },
      itemDescription: { type: String, required: true },
      quantity: { type: Number, required: true, min: 0 },
    },
  ],
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
