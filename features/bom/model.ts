import mongoose, { Schema, model } from "mongoose";

const BomItemSchema = new Schema({
  itemCode: { type: Number, required: true, min: 0 },
  itemDescription: { type: String, required: true, trim: true },
  materialConsideration: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  uom: { type: String },
  rate: { type: Number, required: true, min: 0 },
  currency: { type: String },
  amount: { type: Number, required: true, min: 0 },
  remarks: { type: String },
  level: { type: Number, default: 0, min: 0 },
  parentId: { type: String },
  children: [{ type: Schema.Types.Mixed }], // Self-referencing for recursive structure
});

const BomSchema = new Schema(
  {
    id: { type: String, required: true },
    bomNumber: { type: String, unique: true },
    bomName: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    productCode: { type: String, required: true, trim: true },
    version: { type: String, default: "1.0" },
    bomDate: { type: Date, default: Date.now },
    bomType: { 
      type: String, 
      enum: ["MANUFACTURING", "ENGINEERING", "SALES", "SERVICE"], 
      default: "MANUFACTURING" 
    },
    status: { 
      type: String, 
      enum: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"], 
      default: "DRAFT" 
    },
    items: [BomItemSchema],
    totalMaterialCost: { type: Number, default: 0 },
    description: { type: String },
    notes: { type: String },
    myCompanyName: { type: String },
    createdBy: { type: String },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    // Version control fields
    baseId: { type: String }, // ID of the original BOM (first version)
    parentVersionId: { type: String }, // ID of the previous version
    isLatestVersion: { type: Boolean, default: true }, // Flag to identify the latest version
    versionHistory: [{ 
      versionNumber: { type: String },
      bomId: { type: String },
      createdAt: { type: Date },
      createdBy: { type: String },
      changeDescription: { type: String }
    }],
  },
  { timestamps: true }
);

// Prevent OverwriteModelError
const BomModel = mongoose.models.Bom || model("Bom", BomSchema);

export default BomModel;