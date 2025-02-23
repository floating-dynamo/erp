import mongoose, { Schema, Document, Model } from "mongoose";

export interface EnquiryDocument extends Document {
  id: string;
  customerId: string;
  customerName: string;
  enquiryNumber: string;
  totalItemsPrice?: number;
  totalItemsFinalPrice?: number;
  file?: string; // Storing file as a URL/path instead of a File object
  enquiryDate: Date;
  quotationDueDate: Date;
  items: {
    itemCode?: number;
    itemDescription: string;
    quantity: number;
  }[];
  termsAndConditions?: string;
  isQotationCreated?: boolean;
}

const EnquirySchema = new Schema<EnquiryDocument>(
  {
    id: { type: String, required: true },
    customerId: { type: String, required: true, trim: true },
    customerName: { type: String, required: true },
    enquiryNumber: { type: String, required: true },
    totalItemsPrice: { type: Number },
    totalItemsFinalPrice: { type: Number },
    file: { type: String }, // Store as URL or file path
    enquiryDate: { type: Date, required: true },
    quotationDueDate: { type: Date, required: true },
    items: [
      {
        itemCode: { type: Number },
        itemDescription: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
    termsAndConditions: { type: String },
    isQotationCreated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const EnquiryModel: Model<EnquiryDocument> =
  mongoose.models.Enquiry ||
  mongoose.model<EnquiryDocument>("Enquiry", EnquirySchema);

export default EnquiryModel;
