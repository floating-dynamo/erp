import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import CustomerModel from '../model';
import { createCustomerSchema, updateCustomerSchema } from '../schemas';
import uuid4 from 'uuid4';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();
      const customers = await CustomerModel.find();
      return c.json({ customers });
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

      const updatedCustomer = await CustomerModel.findByIdAndUpdate(
        id,
        parsedData,
        { new: true }
      );

      if (!updatedCustomer) {
        return c.json({ error: 'Customer not found' }, 404);
      }

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
