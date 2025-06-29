import mongoose, { Schema, Document, Model } from 'mongoose';
import { Customer } from './schemas';

const customerAddressSchema = new Schema({
  address1: { type: String, required: false },
  address2: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  country: { type: String, required: false },
  pincode: { type: Number, required: false },
});

const customerPOCSchema = new Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: Number },
  email: { type: String, required: true },
});

const customerFileSchema = new Schema({
  id: { type: String, required: true },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
  description: { type: String },
});

const customerSchema = new Schema({
  id: { type: String },
  name: { type: String, required: true, trim: true },
  address: { type: customerAddressSchema, required: false },
  contactDetails: { type: String },
  poc: { type: [customerPOCSchema], required: false },
  gstNumber: { type: String },
  vendorId: { type: String },
  customerType: { type: String },
  image: { 
    type: String, 
    required: false,
    maxlength: 10485760 // 10MB limit for base64 images (approximately 7.5MB actual image)
  },
  attachments: { type: [customerFileSchema], default: [] },
}, { timestamps: true });

interface ICustomer extends Document, Omit<Customer, 'id'> {}

const CustomerModel: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>('Customer', customerSchema);

export default CustomerModel;
