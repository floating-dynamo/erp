import { connectDB } from "@/lib/db";
import { Hono } from "hono";
import EnquiryModel from "../model";
import { createEnquirySchema } from "../schemas";
import uuid4 from "uuid4";

const app = new Hono()
  .get("/", async (c) => {
    try {
      await connectDB();
      const customerId = c.req.query("customerId");
      let enquiries;

      if (customerId) {
        enquiries = await EnquiryModel.find({ customerId });
      } else {
        enquiries = await EnquiryModel.find();
      }

      return c.json({ enquiries });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch enquiries" }, 500);
    }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();

      const parsedData = createEnquirySchema.parse(body);
      parsedData.id = uuid4();

      const newEnquiry = new EnquiryModel(parsedData);
      await newEnquiry.save();

      return c.json(
        {
          success: true,
          message: "Enquiry added successfully",
        },
        201
      );
    } catch (error) {
      console.log(error);
      return c.json(
        {
          success: false,
          message: "Error adding enquiry",
        },
        400
      );
    }
  })
  .get("/:id", async (c) => {
    try {
      const { id } = c.req.param();
      const enquiry = ((await EnquiryModel.find({ id })) || [])[0];
      if (!enquiry) {
        return c.json({ error: "Enquiry not found" }, 404);
      }
      return c.json(enquiry);
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch enquiry" }, 500);
    }
  });

export default app;
