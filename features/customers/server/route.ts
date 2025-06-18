import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import CustomerModel from '../model';
import { createCustomerSchema, updateCustomerSchema } from '../schemas';
import EnquiryModel from '@/features/enquiries/model';
import QuotationModel from '@/features/quotations/model';
import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';
import v4 from 'uuid4';
import { ZodError } from 'zod';

// Configure file upload directory
const uploadDir = path.join(process.cwd(), 'uploads', 'customers');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
      await connectDB();
      const body = await c.req.json();

      const parsedData = createCustomerSchema.parse(body);
      parsedData.id = v4();

      const newCustomer = new CustomerModel(parsedData);
      await newCustomer.save();

      return c.json(
        {
          success: true,
          message: 'Customer added successfully',
          customer: newCustomer, // Include the created customer data
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
      await connectDB();
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
      await connectDB();
      const { id } = c.req.param();
      const body = await c.req.json();

      // Log the incoming data for debugging
      console.log('Updating customer with ID:', id);
      console.log('Request body:', JSON.stringify(body, null, 2));

      const parsedData = updateCustomerSchema.parse(body);
      
      // Clean up the data - remove empty strings and convert them to appropriate values
      const cleanedData = {
        ...parsedData,
        address: parsedData.address ? {
          ...parsedData.address,
          pincode: parsedData.address.pincode || undefined,
        } : undefined,
        poc: parsedData.poc?.map(contact => ({
          ...contact,
          mobile: contact.mobile || undefined,
        })) || [],
      };

      const updatedCustomer = await CustomerModel.findOneAndUpdate(
        { id },
        cleanedData,
        { new: true, runValidators: true }
      );

      if (!updatedCustomer) {
        return c.json({ error: 'Customer not found' }, 404);
      }

      // Update related documents with the new customer name if it changed
      if (parsedData.name && parsedData.name !== updatedCustomer.name) {
        await EnquiryModel.updateMany(
          { customerId: id },
          { customerName: parsedData.name }
        );

        await QuotationModel.updateMany(
          { customerId: id },
          { customerName: parsedData.name }
        );
      }

      return c.json(
        {
          message: 'Customer updated successfully',
          success: true,
          customer: updatedCustomer,
        },
        200
      );
    } catch (error) {
      console.error('Error updating customer:', error);
      
      // Handle Zod validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return c.json(
          {
            message: 'Validation error',
            success: false,
            errors: (error as ZodError).errors,
          },
          400
        );
      }
      
      return c.json(
        {
          message: 'Error updating customer',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        400
      );
    }
  })

  // File upload endpoint
  .post('/:id/files', async (c) => {
    try {
      await connectDB();
      const customerId = c.req.param('id');

      // Check if customer exists
      const customer = await CustomerModel.findOne({ id: customerId });
      if (!customer) {
        return c.json(
          {
            success: false,
            message: 'Customer not found',
          },
          404
        );
      }

      // Handle file upload
      const req = c.req.raw as NextRequest;
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];

      if (!files || files.length === 0) {
        return c.json(
          {
            success: false,
            message: 'No files provided',
          },
          400
        );
      }

      const uploadedFiles = [];

      for (const file of files) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          return c.json(
            {
              success: false,
              message: `File ${file.name} is too large. Maximum size is 10MB.`,
            },
            400
          );
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/plain',
          'text/csv',
        ];

        if (!allowedTypes.includes(file.type)) {
          return c.json(
            {
              success: false,
              message: `File ${file.name} has an invalid type. Only PDF, DOC, DOCX, XLS, XLSX, images, TXT, and CSV files are allowed.`,
            },
            400
          );
        }

        // Generate unique filename
        const uniqueId = v4();
        const ext = path.extname(file.name);
        const filename = `${uniqueId}${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Save file to disk
        const buffer = await file.arrayBuffer();
        fs.writeFileSync(filepath, Buffer.from(buffer));

        // Create file metadata
        const fileMetadata = {
          id: uniqueId,
          originalName: file.name,
          filename: filename,
          mimetype: file.type,
          size: file.size,
          uploadedAt: new Date(),
          uploadedBy: 'current-user', // TODO: Get from auth context
          description: '', // Can be added later
        };

        uploadedFiles.push(fileMetadata);
      }

      // Update customer with new file attachments
      await CustomerModel.findOneAndUpdate(
        { id: customerId },
        { $push: { attachments: { $each: uploadedFiles } } },
        { new: true }
      );

      return c.json({
        success: true,
        message: `${uploadedFiles.length} file(s) uploaded successfully`,
        files: uploadedFiles,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      return c.json(
        {
          success: false,
          message: 'Error uploading files',
        },
        500
      );
    }
  })

  // GET all files for a customer endpoint
  .get('/:id/files', async (c) => {
    try {
      await connectDB();
      const customerId = c.req.param('id');

      // Check if customer exists
      const customer = await CustomerModel.findOne({ id: customerId });
      if (!customer) {
        return c.json(
          {
            success: false,
            message: 'Customer not found',
          },
          404
        );
      }

      // Return customer files
      return c.json({
        files: customer.attachments || [],
      });
    } catch (error) {
      console.error('Error fetching customer files:', error);
      return c.json(
        {
          success: false,
          message: 'Error fetching files',
        },
        500
      );
    }
  })

  // File download endpoint
  .get('/:id/files/:fileId', async (c) => {
    try {
      await connectDB();
      const customerId = c.req.param('id');
      const fileId = c.req.param('fileId');

      // Get customer and file info
      const customer = await CustomerModel.findOne({ id: customerId });
      if (!customer) {
        return c.json(
          {
            success: false,
            message: 'Customer not found',
          },
          404
        );
      }

      const fileInfo = customer.attachments?.find((file) => file.id === fileId);
      if (!fileInfo) {
        return c.json(
          {
            success: false,
            message: 'File not found',
          },
          404
        );
      }

      const filepath = path.join(uploadDir, fileInfo.filename);

      // Check if file exists on disk
      if (!fs.existsSync(filepath)) {
        return c.json(
          {
            success: false,
            message: 'File not found on server',
          },
          404
        );
      }

      // Read file and return as response
      const fileBuffer = fs.readFileSync(filepath);

      return new Response(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': fileInfo.mimetype,
          'Content-Disposition': `attachment; filename="${fileInfo.originalName}"`,
          'Content-Length': fileInfo.size.toString(),
        },
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      return c.json(
        {
          success: false,
          message: 'Error downloading file',
        },
        500
      );
    }
  })

  // Delete file endpoint
  .delete('/:id/files/:fileId', async (c) => {
    try {
      await connectDB();
      const customerId = c.req.param('id');
      const fileId = c.req.param('fileId');

      const customer = await CustomerModel.findOne({ id: customerId });
      if (!customer) {
        return c.json(
          {
            success: false,
            message: 'Customer not found',
          },
          404
        );
      }

      const fileInfo = customer.attachments?.find((file) => file.id === fileId);
      if (!fileInfo) {
        return c.json(
          {
            success: false,
            message: 'File not found',
          },
          404
        );
      }

      // Remove file from customer record
      await CustomerModel.findOneAndUpdate(
        { id: customerId },
        { $pull: { attachments: { id: fileId } } }
      );

      // Delete file from disk
      const filepath = path.join(uploadDir, fileInfo.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      return c.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      return c.json(
        {
          success: false,
          message: 'Error deleting file',
        },
        500
      );
    }
  });

export default app;
