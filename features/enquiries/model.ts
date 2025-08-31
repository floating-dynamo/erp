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
    itemId: string;
    quantity: number;
    rate?: number;
    amount?: number;
    remarks?: string;
    // Keep for backward compatibility during migration
    itemCode?: number;
    itemDescription?: string;
  }[];
  termsAndConditions?: string;
  isQotationCreated?: boolean;
  attachments?: {
    id: string;
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    uploadedAt?: Date;
    uploadedBy?: string;
    description?: string;
  }[];
}

const enquiryFileSchema = new Schema({
  id: { type: String, required: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
  description: { type: String },
});

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
    termsAndConditions: { type: String },
    isQotationCreated: { type: Boolean, default: false },
    attachments: { type: [enquiryFileSchema], default: [] },
  },
  { timestamps: true }
);

const EnquiryModel: Model<EnquiryDocument> =
  mongoose.models.Enquiry ||
  mongoose.model<EnquiryDocument>("Enquiry", EnquirySchema);

export default EnquiryModel;
