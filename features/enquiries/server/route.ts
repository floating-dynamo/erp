import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import EnquiryModel from '../model';
import { createEnquirySchema } from '../schemas';
import uuid4 from 'uuid4';
import { NextRequest } from 'next/server';
import v4 from 'uuid4';
import fs from 'fs';
import path from 'path';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();
      const customerId = c.req.query('customerId');
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');
      const searchQuery = c.req.query('searchQuery') || '';

      let query = {};
      if (customerId) {
        query = { customerId };
      }

      const skip = (page - 1) * limit;

      // If there's a search query, we'll need to handle it differently
      // For now, let's implement basic server-side filtering
      let enquiries;
      let total;

      if (searchQuery) {
        // For search, return all matching records for client-side pagination
        const searchRegex = new RegExp(searchQuery, 'i');
        const searchFilter = {
          ...query,
          $or: [
            { customerName: searchRegex },
            { enquiryNumber: searchRegex },
            { customerId: searchRegex },
          ],
        };
        enquiries = await EnquiryModel.find(searchFilter);
        total = enquiries.length;
      } else {
        // For normal pagination, use server-side pagination
        enquiries = await EnquiryModel.find(query).skip(skip).limit(limit);
        total = await EnquiryModel.countDocuments(query);
      }

      const totalPages = Math.ceil(total / limit);

      return c.json({
        enquiries,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch enquiries' }, 500);
    }
  })
  .post('/', async (c) => {
    try {
      const body = await c.req.json();

      const parsedData = createEnquirySchema.parse(body);
      parsedData.id = uuid4();

      const newEnquiry = new EnquiryModel(parsedData);
      await newEnquiry.save();

      return c.json(
        {
          success: true,
          message: 'Enquiry added successfully',
          enquiry: {
            id: parsedData.id,
          },
        },
        201
      );
    } catch (error) {
      console.log(error);
      return c.json(
        {
          success: false,
          message: 'Error adding enquiry',
        },
        400
      );
    }
  })
  .get('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const enquiry = ((await EnquiryModel.find({ id })) || [])[0];
      if (!enquiry) {
        return c.json({ error: 'Enquiry not found' }, 404);
      }
      return c.json(enquiry);
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch enquiry' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();

      const parsedData = createEnquirySchema.parse(body);

      const enquiry = ((await EnquiryModel.find({ id })) || [])[0];
      if (!enquiry) {
        return c.json({ error: 'Enquiry not found' }, 404);
      }
      await EnquiryModel.updateOne({ id }, { $set: parsedData });
      return c.json({ success: true, message: 'Enquiry updated successfully' });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to update enquiry' }, 500);
    }
  })
  
  // File upload endpoint
  .post('/:id/files', async (c) => {
    try {
      await connectDB();
      const enquiryId = c.req.param('id');

      // Check if enquiry exists
      const enquiry = await EnquiryModel.findOne({ id: enquiryId });
      if (!enquiry) {
        return c.json(
          {
            success: false,
            message: 'Enquiry not found',
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
      
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', 'enquiries');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

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

      // Update enquiry with new file attachments
      await EnquiryModel.findOneAndUpdate(
        { id: enquiryId },
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

  // GET all files for an enquiry endpoint
  .get('/:id/files', async (c) => {
    try {
      await connectDB();
      const enquiryId = c.req.param('id');

      // Check if enquiry exists
      const enquiry = await EnquiryModel.findOne({ id: enquiryId });
      if (!enquiry) {
        return c.json(
          {
            success: false,
            message: 'Enquiry not found',
          },
          404
        );
      }

      // Return enquiry files
      return c.json({
        files: enquiry.attachments || [],
      });
    } catch (error) {
      console.error('Error fetching enquiry files:', error);
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
      const enquiryId = c.req.param('id');
      const fileId = c.req.param('fileId');

      // Get enquiry and file info
      const enquiry = await EnquiryModel.findOne({ id: enquiryId });
      if (!enquiry) {
        return c.json(
          {
            success: false,
            message: 'Enquiry not found',
          },
          404
        );
      }

      const fileInfo = enquiry.attachments?.find((file) => file.id === fileId);
      if (!fileInfo) {
        return c.json(
          {
            success: false,
            message: 'File not found',
          },
          404
        );
      }

      const uploadDir = path.join(process.cwd(), 'uploads', 'enquiries');
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
      const enquiryId = c.req.param('id');
      const fileId = c.req.param('fileId');

      const enquiry = await EnquiryModel.findOne({ id: enquiryId });
      if (!enquiry) {
        return c.json(
          {
            success: false,
            message: 'Enquiry not found',
          },
          404
        );
      }

      const fileInfo = enquiry.attachments?.find((file) => file.id === fileId);
      if (!fileInfo) {
        return c.json(
          {
            success: false,
            message: 'File not found',
          },
          404
        );
      }

      // Remove file from enquiry record
      await EnquiryModel.findOneAndUpdate(
        { id: enquiryId },
        { $pull: { attachments: { id: fileId } } }
      );

      // Delete file from disk
      const uploadDir = path.join(process.cwd(), 'uploads', 'enquiries');
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
