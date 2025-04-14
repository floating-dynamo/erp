import mongoose, { Schema } from 'mongoose';

const WorkOderSchema = new Schema({
  woNumber: { type: String, required: true, trim: true },
  woDescription: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 1 },
  purpose: { type: String, required: false, trim: true },
  remarks: { type: String, required: false, trim: true },
});

const SupplierDcSchema = new Schema(
  {
    id: { type: String, required: true },
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    gstIn: { type: String, required: true, trim: true },
    poRef: { type: String, required: true, trim: true },
    dcNo: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    workOrders: [WorkOderSchema],
    returnable: { type: Boolean },
    nonreturnable: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

const SupplierDcModel =
  mongoose.models.SupplierDc || mongoose.model('SupplierDc', SupplierDcSchema);

export default SupplierDcModel;
