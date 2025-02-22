import mongoose, { Schema, Document, Model } from "mongoose";
import { Customer } from "./schemas";

const customerAddressSchema = new Schema({
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: Number },
});

const customerPOCSchema = new Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: Number },
  email: { type: String, required: true },
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
  image: { type: String },
});

interface ICustomer extends Document, Omit<Customer, "id"> {}

const CustomerModel: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", customerSchema);

export default CustomerModel;
