import mongoose, { Schema, model } from "mongoose";

const QuotationFileSchema = new Schema({
  id: { type: String, required: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true }, // Unique filename on server
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String }, // User ID who uploaded
  description: { type: String }, // Optional description
});

const QuotationItemSchema = new Schema({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0.01 },
  rate: { type: Number, min: 0 },
  amount: { type: Number, min: 0 },
  remarks: { type: String },
  // Quotation-specific fields
  materialConsideration: { type: String },
  uom: { type: String },
  currency: { type: String },
  // Keep for backward compatibility during migration
  itemCode: { type: Number },
  itemDescription: { type: String },
});

const QuotationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerId: { type: String, required: true },
    enquiryNumber: { type: String },
    quotationDate: { type: Date, default: Date.now },
    quoteNumber: { type: String, unique: true },
    items: [QuotationItemSchema],
    totalAmount: { type: Number },
    termsAndConditions: { type: String },
    myCompanyGSTIN: { type: String },
    myCompanyPAN: { type: String },
    myCompanyName: { type: String },
    attachments: [QuotationFileSchema],
  },
  { timestamps: true }
);

// Add index for the custom id field
QuotationSchema.index({ id: 1 });

// Prevent OverwriteModelError
const QuotationModel =
  mongoose.models.Quotation || model("Quotation", QuotationSchema);

export default QuotationModel;
