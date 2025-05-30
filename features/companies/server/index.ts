import { Hono } from 'hono';
import { CompaniesModel } from '../model';

const app = new Hono()
  // Get my companies for settings management
  .get('/my-companies', async (c) => {
    try {
      const companies = await CompaniesModel.getMyCompanies();
      
      return c.json({
        success: true,
        companies,
      });
    } catch (error) {
      console.error('Error fetching my companies:', error);
      return c.json(
        { 
          success: false, 
          message: 'Error fetching companies' 
        }, 
        500
      );
    }
  })
  
  // Set active company
  .post('/set-active', async (c) => {
    try {
      const body = await c.req.json();
      const { companyId } = body;
      
      if (!companyId) {
        return c.json(
          { 
            success: false, 
            message: 'Company ID is required' 
          }, 
          400
        );
      }
      
      const result = await CompaniesModel.setActiveCompany(companyId);
      
      return c.json(result, 200);
    } catch (error) {
      console.error('Error setting active company:', error);
      return c.json(
        { 
          success: false, 
          message: 'Error setting active company' 
        }, 
        400
      );
    }
  });

export default app;