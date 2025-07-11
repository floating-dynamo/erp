import { connectDB } from "@/lib/db";
import { Hono, Context } from "hono";
import BomModel from "../model";
import { createBomSchema, editBomSchema } from "../schemas";
import { BomFilter, BomItemFormData } from "../types";
import uuid4 from "uuid4";
import { generateBomNumber } from "@/lib/utils";
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Interface for JWT payload
interface CustomJWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Interface for authenticated user
interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

// Helper function to extract user from JWT token
const getUserFromToken = async (c: Context): Promise<AuthenticatedUser | null> => {
  try {
    let token = getCookie(c, 'auth-token');
    
    if (!token) {
      const authHeader = c.req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    const payload = await verify(token, JWT_SECRET) as unknown as CustomJWTPayload;
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
};

const app = new Hono()
  .get("/", async (c) => {
    try {
      await connectDB();
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");
      const searchQuery = c.req.query("searchQuery") || "";

      // Extract filter parameters
      const productNameFilter = c.req.query("productNameFilter") || "";
      const bomTypeFilter = c.req.query("bomTypeFilter") || "";
      const statusFilter = c.req.query("statusFilter") || "";
      const costFrom = c.req.query("costFrom") || "";
      const costTo = c.req.query("costTo") || "";

      const skip = (page - 1) * limit;

      // Build filter object
      const filter: BomFilter = {};

      if (productNameFilter) {
        filter.productName = productNameFilter;
      }

      if (bomTypeFilter) {
        filter.bomType = bomTypeFilter;
      }

      if (statusFilter) {
        filter.status = statusFilter;
      }

      if (costFrom || costTo) {
        filter.totalMaterialCost = {};
        if (costFrom) filter.totalMaterialCost.$gte = parseFloat(costFrom);
        if (costTo) filter.totalMaterialCost.$lte = parseFloat(costTo);
      }

      let boms;
      let total;

      if (searchQuery) {
        // For search, get all results and let client handle pagination
        const searchRegex = new RegExp(searchQuery, "i");
        const searchFilter = {
          $or: [
            { bomName: searchRegex },
            { productName: searchRegex },
            { productCode: searchRegex },
            { bomNumber: searchRegex },
            { bomType: searchRegex },
            { status: searchRegex },
          ],
        };
        boms = await BomModel.find(searchFilter);
        total = boms.length;
      } else {
        // For normal pagination, use server-side pagination with the filters
        boms = await BomModel.find(filter).skip(skip).limit(limit);
        total = await BomModel.countDocuments(filter);
      }

      const totalPages = Math.ceil(total / limit);

      return c.json({
        boms,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch BOMs" }, 500);
    }
  })
  .post("/", async (c) => {
    try {
      await connectDB();
      
      // Extract user information from JWT token
      const user = await getUserFromToken(c);
      if (!user) {
        return c.json({
          success: false,
          message: "Authentication required",
        }, 401);
      }

      const body = await c.req.json();

      const parsedData = createBomSchema.parse(body);
      parsedData.id = uuid4();
      
      // Automatically set createdBy field with current user's email
      parsedData.createdBy = user.email;
      
      const boms = await BomModel.find();
      parsedData.bomNumber = generateBomNumber(
        new Date().toISOString(),
        `${boms.length + 1}`
      );
      
      // Calculate total material cost recursively
      const calculateTotalCost = (items: BomItemFormData[]): number => {
        return items.reduce((total, item) => {
          let itemTotal = item.amount || 0;
          if (item.children && item.children.length > 0) {
            itemTotal += calculateTotalCost(item.children);
          }
          return total + itemTotal;
        }, 0);
      };

      parsedData.totalMaterialCost = calculateTotalCost(parsedData.items as BomItemFormData[]);

      const newBom = new BomModel(parsedData);
      await newBom.save();

      return c.json(
        {
          success: true,
          message: "BOM added successfully",
          bomNumber: newBom.bomNumber,
        },
        201
      );
    } catch (error) {
      console.log(error);
      return c.json(
        {
          success: false,
          message: "Error adding BOM",
        },
        400
      );
    }
  })
  .get("/:id", async (c) => {
    try {
      const { id } = c.req.param();
      const bom = ((await BomModel.find({ id })) || [])[0];
      if (!bom) {
        return c.json({ error: "BOM not found" }, 404);
      }
      return c.json(bom);
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch BOM" }, 500);
    }
  })
  .patch("/:id", async (c) => {
    try {
      await connectDB();
      
      // Extract user information from JWT token
      const user = await getUserFromToken(c);
      if (!user) {
        return c.json({
          success: false,
          message: "Authentication required",
        }, 401);
      }

      const { id } = c.req.param();
      const body = await c.req.json();

      const parsedData = editBomSchema.parse(body);

      // For updates, we don't change createdBy, but we could add updatedBy if needed
      // parsedData.updatedBy = user.email;

      // Calculate total material cost recursively
      const calculateTotalCost = (items: BomItemFormData[]): number => {
        return items.reduce((total, item) => {
          let itemTotal = item.amount || 0;
          if (item.children && item.children.length > 0) {
            itemTotal += calculateTotalCost(item.children);
          }
          return total + itemTotal;
        }, 0);
      };

      parsedData.totalMaterialCost = calculateTotalCost(parsedData.items as BomItemFormData[]);

      const updatedBom = await BomModel.findOneAndUpdate(
        { id },
        parsedData,
        { new: true }
      );

      if (!updatedBom) {
        return c.json({ error: "BOM not found" }, 404);
      }

      return c.json({
        message: "BOM updated successfully",
        success: true,
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to update BOM" }, 500);
    }
  });

export default app;