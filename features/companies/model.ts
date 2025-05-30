import mongoose, { Schema } from 'mongoose';
import { Company } from './schemas';
import { connectDB } from '@/lib/db';

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

// Mock data for "My Companies" - companies associated with the current user
const MY_COMPANIES_MOCK_DATA = [
  {
    id: 'comp-1',
    name: 'Tech Solutions Pvt Ltd',
    email: 'contact@techsolutions.com',
    contact: '9876543210',
    address: '123 Business Park, IT District',
    city: 'Bangalore',
    state: 'Karnataka',
    pinCode: '560001',
    gstNumber: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    isActive: true,
  },
  {
    id: 'comp-2',
    name: 'Global Manufacturing Co',
    email: 'info@globalmanufacturing.com',
    contact: '9876543211',
    address: '456 Industrial Area, Sector 5',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    gstNumber: '27FGHIJ5678K2L9',
    pan: 'FGHIJ5678K',
    isActive: false,
  },
  {
    id: 'comp-3',
    name: 'Innovative Services Ltd',
    email: 'hello@innovativeservices.com',
    contact: '9876543212',
    address: '789 Commercial Complex, Block A',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110001',
    gstNumber: '07MNOPQ9012R3S4',
    pan: 'MNOPQ9012R',
    isActive: false,
  },
];

// Enhanced Companies Model with settings management methods
export class CompaniesModel {
  /**
   * Get companies associated with the current user for settings management
   * @returns Array of user's companies
   */
  static async getMyCompanies() {
    try {
      await connectDB();
      
      // In a production environment, you would fetch from MongoDB
      // const companies = await CompanyModel.find({ userId: currentUserId });
      
      // Using mock data for development
      return MY_COMPANIES_MOCK_DATA;
    } catch (error) {
      console.error('Error fetching my companies:', error);
      throw error;
    }
  }

  /**
   * Set a company as active for the current user
   * @param companyId ID of the company to set as active
   * @returns Success response with active company details
   */
  static async setActiveCompany(companyId: string) {
    try {
      await connectDB();
      
      // Find the company to activate
      const companyToActivate = MY_COMPANIES_MOCK_DATA.find(c => c.id === companyId);
      
      if (!companyToActivate) {
        throw new Error('Company not found');
      }
      
      // Set all companies to inactive
      MY_COMPANIES_MOCK_DATA.forEach(company => {
        company.isActive = false;
      });
      
      // Set the selected company as active
      companyToActivate.isActive = true;
      
      // In a production environment, you would update in MongoDB
      // await CompanyModel.updateMany({ userId: currentUserId }, { isActive: false });
      // await CompanyModel.updateOne({ _id: companyId }, { isActive: true });
      
      return {
        success: true,
        message: `${companyToActivate.name} is now the active company`,
        activeCompany: companyToActivate,
      };
    } catch (error) {
      console.error('Error setting active company:', error);
      throw error;
    }
  }
}

export default CompanyModel;
export { MY_COMPANIES_MOCK_DATA };
