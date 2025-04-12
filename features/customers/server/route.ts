import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import CustomerModel from '../model';
import { createCustomerSchema, updateCustomerSchema } from '../schemas';
import uuid4 from 'uuid4';
import EnquiryModel from '@/features/enquiries/model';
import QuotationModel from '@/features/quotations/model';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();

      const country = c.req.query('country');
      const state = c.req.query('state');
      const city = c.req.query('city');

      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);
      const skip = (page - 1) * limit;

      const query: Record<string, string> = {};
      if (country) query['address.country'] = country;
      if (state) query['address.state'] = state;
      if (city) query['address.city'] = city;

      const customers = await CustomerModel.find(query).skip(skip).limit(limit);
      const totalCustomers = await CustomerModel.countDocuments(query);
      return c.json({
        customers,
        total: totalCustomers,
        page,
        limit,
        totalPages: Math.ceil(totalCustomers / limit),
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch customers' }, 500);
    }
  })
  .post('/', async (c) => {
    try {
      const body = await c.req.json();

      const parsedData = createCustomerSchema.parse(body);
      parsedData.id = uuid4();

      const newCustomer = new CustomerModel(parsedData);
      await newCustomer.save();

      return c.json(
        {
          success: true,
          message: 'Customer added successfully',
        },
        201
      );
    } catch (error) {
      console.log(error);
      return c.json(
        {
          success: false,
          message: 'Error adding customer',
        },
        400
      );
    }
  })
  .get('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const customer = ((await CustomerModel.find({ id })) || [])[0];
      if (!customer) {
        return c.json({ error: 'Customer not found' }, 404);
      }
      return c.json(customer);
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch customer' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();

      const parsedData = updateCustomerSchema.parse(body);

      const updatedCustomer = await CustomerModel.findOneAndUpdate(
        { id },
        parsedData,
        { new: true }
      );

      if (!updatedCustomer) {
        return c.json({ error: 'Customer not found' }, 404);
      }

      await EnquiryModel.findOneAndUpdate(
        { customerId: id },
        { customerName: updatedCustomer.name }
      );

      await QuotationModel.findOneAndUpdate(
        { customerId: id },
        { customerName: updatedCustomer.name }
      );

      return c.json(
        {
          message: 'Customer updated successfully',
          success: true,
        },
        200
      );
    } catch (error) {
      console.log(error);
      return c.json(
        {
          message: 'Error updating customer',
          success: false,
        },
        400
      );
    }
  });

export default app;
