import CompanyModel from '../model';
import { createCompanySchema } from '../schemas';
import { Hono } from 'hono';
import uuid4 from 'uuid4';

const app = new Hono()
  .post('/', async (c) => {
    try {
      const body = await c.req.json();

      const parsedData = createCompanySchema.parse(body);
      const newCompany = new CompanyModel({
        ...parsedData,
        id: uuid4(),
      });
      await newCompany.save();

      return c.json(
        {
          success: true,
          message: 'Company added successfully',
        },
        201
      );
    } catch (error) {
      console.log(error);
      return c.json(
        {
          success: false,
          message: 'Error adding company',
        },
        400
      );
    }
  })
  .get('/', async (c) => {
    try {
      const companies = await CompanyModel.find();
      return c.json({ companies });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to fetch companies' }, 500);
    }
  });

export default app;
