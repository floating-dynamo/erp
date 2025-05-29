import { connectDB } from "@/lib/db";
import { Hono } from "hono";
import QuotationModel from "../model";
import { createQuotationSchema, editQuotationSchema } from "../schemas";
import { QuotationFilter } from "../types";
import uuid4 from "uuid4";
import EnquiryModel from "@/features/enquiries/model";
import { generateQuoteNumber } from "@/lib/utils";

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
  });

export default app;
