import mongoose, { Schema, model } from "mongoose";

const QuotationItemSchema = new Schema({
  itemCode: { type: Number, required: true, min: 0 },
  itemDescription: { type: String, required: true, trim: true },
  materialConsideration: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  uom: { type: String },
  rate: { type: Number, required: true, min: 0 },
  currency: { type: String },
  amount: { type: Number, required: true, min: 0 },
  remarks: { type: String },
});

const QuotationSchema = new Schema(
  {
    id: { type: String, required: true },
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
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
const QuotationModel =
  mongoose.models.Quotation || model("Quotation", QuotationSchema);

export default QuotationModel;
