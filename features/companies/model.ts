import mongoose, { Schema } from 'mongoose';
import { Company } from './schemas';

const CompanySchema: Schema = new Schema<Company>({
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  gstNumber: { type: String, required: true },
  pinCode: { type: Number, required: true },
  contact: { type: Number, required: true },
  email: { type: String, required: true },
  id: { type: String, required: false },
});

const CompanyModel =
  mongoose.models.Company || mongoose.model<Company>('Company', CompanySchema);
export default CompanyModel;
