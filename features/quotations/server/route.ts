import { connectDB } from "@/lib/db";
import { Hono } from "hono";
import QuotationModel from "../model";
import { createQuotationSchema, editQuotationSchema, QuotationFile } from "../schemas";
import { QuotationFilter } from "../types";
import uuid4 from "uuid4";
import EnquiryModel from "@/features/enquiries/model";
import { generateQuoteNumber } from "@/lib/utils";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const app = new Hono()
  .get("/", async (c) => {
    try {
      await connectDB();
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");
      const searchQuery = c.req.query("searchQuery") || "";

      // Extract new filter parameters
      const customerFilter = c.req.query("customerFilter") || "";
      const enquiryNumberFilter = c.req.query("enquiryNumberFilter") || "";
      const amountFrom = c.req.query("amountFrom") || "";
      const amountTo = c.req.query("amountTo") || "";

      const skip = (page - 1) * limit;

      // Build the filter object based on provided filters
      const filter: QuotationFilter = {};

      // Apply customer filter
      if (customerFilter) {
        filter.customerId = customerFilter;
      }

      // Apply enquiry number filter
      if (enquiryNumberFilter) {
        filter.enquiryNumber = enquiryNumberFilter;
      }

      // Apply amount range filters
      if (amountFrom || amountTo) {
        filter.totalAmount = {};

        if (amountFrom) {
          filter.totalAmount.$gte = Number(amountFrom);
        }

        if (amountTo) {
          filter.totalAmount.$lte = Number(amountTo);
        }
      }

      // If there's a search query, we'll need to handle it differently
      let quotations;
      let total;

      if (searchQuery) {
        // For search, return all matching records for client-side pagination
        const searchRegex = new RegExp(searchQuery, "i");
        const searchFilter = {
          ...filter, // Include the existing filters
          $or: [
            { customerName: searchRegex },
            { enquiryNumber: searchRegex },
            { quoteNumber: searchRegex },
            { customerId: searchRegex },
          ],
        };
        quotations = await QuotationModel.find(searchFilter);
        total = quotations.length;
      } else {
        // For normal pagination, use server-side pagination with the filters
        quotations = await QuotationModel.find(filter).skip(skip).limit(limit);
        total = await QuotationModel.countDocuments(filter);
      }

      const totalPages = Math.ceil(total / limit);

      return c.json({
        quotations,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch quotations" }, 500);
    }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();

      const parsedData = createQuotationSchema.parse(body);
      parsedData.id = uuid4();
      const quotations = await QuotationModel.find();
      parsedData.quoteNumber = generateQuoteNumber(
        new Date().toISOString(),
        `${quotations.length + 1}`
      );
      parsedData.totalAmount = parsedData.items.reduce(
        (acc, prev) => prev.amount + acc,
        0
      );

      // Fetch the enquiry and set isQuotationCreated to true
      const enquiry = await EnquiryModel.findOne({
        enquiryNumber: parsedData.enquiryNumber,
      });
      if (!enquiry) {
        return c.json({ error: "Enquiry not found" }, 404);
      }
      enquiry.isQotationCreated = true;
      await enquiry.save();

      const newQuotation = new QuotationModel(parsedData);
      await newQuotation.save();

      return c.json(
        {
          success: true,
          message: "Quotation added successfully",
          quoteNumber: newQuotation.quoteNumber,
          id: newQuotation.id, // Return the ID for file uploads
        },
        201
      );
    } catch (error) {
      console.log(error);
      return c.json(
        {
          success: false,
          message: "Error adding quotation",
        },
        400
      );
    }
  })
  .get("/:id", async (c) => {
    try {
      const { id } = c.req.param();
      const quotation = ((await QuotationModel.find({ id })) || [])[0];
      if (!quotation) {
        return c.json({ error: "Quotation not found" }, 404);
      }
      return c.json(quotation);
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch quotation" }, 500);
    }
  })
  .patch("/:id", async (c) => {
    try {
      await connectDB();
      const { id } = c.req.param();
      const body = await c.req.json();

      const parsedData = editQuotationSchema.parse(body);

      const updatedQuotation = await QuotationModel.findOneAndUpdate(
        { id },
        parsedData,
        { new: true }
      );

      if (!updatedQuotation) {
        return c.json({ error: "Quotation not found" }, 404);
      }

      return c.json({
        message: "Quotation updated successfully",
        success: true,
      });
    } catch (error) {
      console.error(error);
      return c.json(
        {
          message: "Error updating quotation",
          success: false,
        },
        400
      );
    }
  })

  // File upload endpoint
  .post('/:id/files', async (c) => {
    try {
      await connectDB();
      const quotationId = c.req.param('id');
      
      console.log('Server - File upload endpoint called for quotation:', quotationId);

      // Check if quotation exists
      const quotation = await QuotationModel.findOne({ id: quotationId });
      if (!quotation) {
        console.log('Server - Quotation not found:', quotationId);
        return c.json(
          {
            success: false,
            message: 'Quotation not found',
          },
          404
        );
      }

      // Handle file upload
      const req = c.req.raw as NextRequest;
      const formData = await req.formData();
      const files = formData.getAll('files') as File[];

      console.log('Server - Received files:', files.length);
      files.forEach((file, index) => {
        console.log(`Server - File ${index + 1}:`, file.name, file.size, 'bytes');
      });

      if (!files || files.length === 0) {
        console.log('Server - No files provided');
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
      const uploadDir = path.join(process.cwd(), 'uploads', 'quotations');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const file of files) {
        console.log('Server - Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          console.log('Server - File too large:', file.name, file.size);
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
        const uniqueId = uuid4();
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

      console.log('Server - Uploaded files:', uploadedFiles.length);
      uploadedFiles.forEach((file, index) => {
        console.log(`Server - Uploaded file ${index + 1}:`, file.originalName, file.id);
      });

      // Update quotation with new file attachments
      console.log('Server - Updating quotation with attachments:', quotationId);
      const updatedQuotation = await QuotationModel.findOneAndUpdate(
        { id: quotationId },
        { $push: { attachments: { $each: uploadedFiles } } },
        { new: true }
      );

      console.log('Server - Quotation updated, total attachments:', updatedQuotation?.attachments?.length || 0);

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

  // GET all files for a quotation endpoint
  .get('/:id/files', async (c) => {
    try {
      await connectDB();
      const quotationId = c.req.param('id');

      // Check if quotation exists
      const quotation = await QuotationModel.findOne({ id: quotationId });
      if (!quotation) {
        return c.json(
          {
            success: false,
            message: 'Quotation not found',
          },
          404
        );
      }

      return c.json({
        success: true,
        files: quotation.attachments || [],
      });
    } catch (error) {
      console.error('Error fetching files:', error);
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
      const quotationId = c.req.param('id');
      const fileId = c.req.param('fileId');

      // Get quotation and file info
      const quotation = await QuotationModel.findOne({ id: quotationId });
      if (!quotation) {
        return c.json(
          {
            success: false,
            message: 'Quotation not found',
          },
          404
        );
      }

      const fileInfo = quotation.attachments?.find((file: QuotationFile) => file.id === fileId);
      if (!fileInfo) {
        return c.json(
          {
            success: false,
            message: 'File not found',
          },
          404
        );
      }

      const uploadDir = path.join(process.cwd(), 'uploads', 'quotations');
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
      const quotationId = c.req.param('id');
      const fileId = c.req.param('fileId');

      const quotation = await QuotationModel.findOne({ id: quotationId });
      if (!quotation) {
        return c.json(
          {
            success: false,
            message: 'Quotation not found',
          },
          404
        );
      }

      const fileInfo = quotation.attachments?.find((file: QuotationFile) => file.id === fileId);
      if (!fileInfo) {
        return c.json(
          {
            success: false,
            message: 'File not found',
          },
          404
        );
      }

      // Remove file from quotation record
      await QuotationModel.findOneAndUpdate(
        { id: quotationId },
        { $pull: { attachments: { id: fileId } } }
      );

      // Delete file from disk
      const uploadDir = path.join(process.cwd(), 'uploads', 'quotations');
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
