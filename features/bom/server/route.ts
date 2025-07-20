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

// Helper function to generate next version number
const generateNextVersion = (currentVersion: string): string => {
  const versionParts = currentVersion.split('.');
  if (versionParts.length >= 2) {
    const major = parseInt(versionParts[0]) || 1;
    const minor = parseInt(versionParts[1]) || 0;
    return `${major}.${minor + 1}`;
  }
  return '1.1';
};

// Helper function to create version history entry
const createVersionHistoryEntry = (version: string, bomId: string, createdBy: string, changeDescription?: string) => {
  return {
    versionNumber: version,
    bomId: bomId,
    createdAt: new Date(),
    createdBy: createdBy,
    changeDescription: changeDescription || 'Version updated'
  };
};

const app = new Hono()
  .get("/", async (c) => {
    try {
      await connectDB();
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");
      const searchQuery = c.req.query("searchQuery") || "";
      const includeAllVersions = c.req.query("includeAllVersions") === "true";

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

      // Only include latest versions by default unless specified otherwise
      if (!includeAllVersions) {
        filter.isLatestVersion = true;
      }

      let boms;
      let total;

      if (searchQuery) {
        // For search, get all results and let client handle pagination
        const searchRegex = new RegExp(searchQuery, "i");
        const searchFilter = {
          ...filter,
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
        includeAllVersions,
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

      // Set version control fields for initial creation
      parsedData.baseId = parsedData.id; // For the first version, baseId is the same as id
      parsedData.isLatestVersion = true;
      
      // Create the BOM data with version history
      const bomData = {
        ...parsedData,
        versionHistory: [
          createVersionHistoryEntry(parsedData.version || '1.0', parsedData.id, user.email, 'Initial BOM creation')
        ]
      };

      const newBom = new BomModel(bomData);
      await newBom.save();

      return c.json(
        {
          success: true,
          message: "BOM added successfully",
          bomNumber: newBom.bomNumber,
          id: newBom.id,
          version: newBom.version,
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

      // Find the current BOM
      const currentBom = await BomModel.findOne({ id });
      if (!currentBom) {
        return c.json({ error: "BOM not found" }, 404);
      }

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

      // Generate new version number
      const newVersion = generateNextVersion(currentBom.version);
      
      // Mark current BOM as not the latest version
      await BomModel.findOneAndUpdate(
        { id },
        { isLatestVersion: false }
      );

      // Create new version data
      const newVersionData = {
        ...parsedData,
        id: uuid4(), // New unique ID for the new version
        bomNumber: currentBom.bomNumber, // Keep the same BOM number
        version: newVersion,
        baseId: currentBom.baseId || currentBom.id, // Reference to the original BOM
        parentVersionId: currentBom.id, // Reference to the previous version
        isLatestVersion: true,
        createdBy: user.email,
        totalMaterialCost: calculateTotalCost(parsedData.items as BomItemFormData[]),
      };

      // Get existing version history from the base BOM
      const baseBom = await BomModel.findOne({ id: currentBom.baseId || currentBom.id });
      const existingHistory = baseBom?.versionHistory || [];

      // Create new version history entry
      const newHistoryEntry = createVersionHistoryEntry(
        newVersion, 
        newVersionData.id, 
        user.email, 
        parsedData.changeDescription || 'BOM updated'
      );

      // Create the new BOM version with updated history
      const newBomData = {
        ...newVersionData,
        versionHistory: [...existingHistory, newHistoryEntry]
      };

      const newBomVersion = new BomModel(newBomData);
      await newBomVersion.save();

      // Update all versions of this BOM with the new version history
      await BomModel.updateMany(
        { 
          $or: [
            { baseId: currentBom.baseId || currentBom.id },
            { id: currentBom.baseId || currentBom.id }
          ]
        },
        { 
          $set: { 
            versionHistory: [...existingHistory, newHistoryEntry]
          }
        }
      );

      return c.json({
        message: "New BOM version created successfully",
        success: true,
        newVersion: newVersion,
        newVersionId: newBomVersion.id,
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to create new BOM version" }, 500);
    }
  })
  
  // Get all versions of a BOM
  .get("/:id/versions", async (c) => {
    try {
      await connectDB();
      const { id } = c.req.param();
      
      // Find the current BOM to get baseId
      const currentBom = await BomModel.findOne({ id });
      if (!currentBom) {
        return c.json({ error: "BOM not found" }, 404);
      }

      const baseId = currentBom.baseId || currentBom.id;
      
      // Get all versions of this BOM
      const allVersions = await BomModel.find({
        $or: [
          { baseId: baseId },
          { id: baseId }
        ]
      }).sort({ createdAt: -1 }); // Sort by creation date, newest first

      return c.json({
        versions: allVersions,
        total: allVersions.length
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch BOM versions" }, 500);
    }
  })
  
  // Get version history for a BOM
  .get("/:id/history", async (c) => {
    try {
      await connectDB();
      const { id } = c.req.param();
      
      // Find the current BOM
      const currentBom = await BomModel.findOne({ id });
      if (!currentBom) {
        return c.json({ error: "BOM not found" }, 404);
      }

      return c.json({
        versionHistory: currentBom.versionHistory || [],
        currentVersion: currentBom.version,
        isLatestVersion: currentBom.isLatestVersion
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch BOM version history" }, 500);
    }
  })
  
  // Get latest version of a BOM by baseId
  .get("/latest/:baseId", async (c) => {
    try {
      await connectDB();
      const { baseId } = c.req.param();
      
      // Find the latest version
      const latestBom = await BomModel.findOne({
        $or: [
          { baseId: baseId, isLatestVersion: true },
          { id: baseId, isLatestVersion: true }
        ]
      });

      if (!latestBom) {
        return c.json({ error: "Latest BOM version not found" }, 404);
      }

      return c.json(latestBom);
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to fetch latest BOM version" }, 500);
    }
  });

export default app;