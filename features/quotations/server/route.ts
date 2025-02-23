import { connectDB } from "@/lib/db";
import { Hono } from "hono";
import QuotationModel from "../model";
import { createQuotationSchema } from "../schemas";
import uuid4 from "uuid4";
import EnquiryModel from "@/features/enquiries/model";

const app = new Hono()
  .get("/", async (c) => {
    try {
      await connectDB();
      const quotations = await QuotationModel.find();
      return c.json({ quotations });
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
  });

export default app;
