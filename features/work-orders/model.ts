import mongoose, { Schema, model } from "mongoose";

const WorkOrderResourceSchema = new Schema({
  resourceType: { 
    type: String, 
    enum: ["MATERIAL", "LABOR", "EQUIPMENT", "OVERHEAD"], 
    required: true 
  },
  resourceName: { type: String, required: true, trim: true },
  resourceCode: { type: String, trim: true },
  plannedQuantity: { type: Number, required: true, min: 0 },
  actualQuantity: { type: Number, default: 0, min: 0 },
  uom: { type: String, required: true },
  standardCost: { type: Number, required: true, min: 0 },
  actualCost: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: "INR" },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ["PLANNED", "ALLOCATED", "IN_USE", "COMPLETED", "RETURNED"], 
    default: "PLANNED" 
  },
  remarks: { type: String },
});

const WorkOrderOperationSchema = new Schema({
  operationSequence: { type: Number, required: true, min: 1 },
  operationName: { type: String, required: true, trim: true },
  operationCode: { type: String, trim: true },
  workCenter: { type: String, required: true, trim: true },
  setupTime: { type: Number, default: 0, min: 0 }, // in minutes
  runTime: { type: Number, required: true, min: 0 }, // in minutes per unit
  totalPlannedTime: { type: Number, required: true, min: 0 }, // in minutes
  actualTime: { type: Number, default: 0, min: 0 }, // in minutes
  operator: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ["PLANNED", "STARTED", "PAUSED", "COMPLETED", "SKIPPED"], 
    default: "PLANNED" 
  },
  startDateTime: { type: Date },
  endDateTime: { type: Date },
  qualityChecks: [{
    checkPoint: { type: String, required: true },
    specification: { type: String },
    actualValue: { type: String },
    status: { 
      type: String, 
      enum: ["PASS", "FAIL", "PENDING"], 
      default: "PENDING" 
    },
    checkedBy: { type: String },
    checkedAt: { type: Date },
    remarks: { type: String }
  }],
  notes: { type: String },
});

const WorkOrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    workOrderNumber: { type: String, unique: true }, // WO/YY/MM/DD/00000
    workOrderName: { type: String, required: true, trim: true },
    workOrderType: { 
      type: String, 
      enum: ["PRODUCTION", "MAINTENANCE", "REWORK", "PROTOTYPE", "REPAIR"], 
      default: "PRODUCTION" 
    },
    priority: { 
      type: String, 
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"], 
      default: "NORMAL" 
    },
    status: { 
      type: String, 
      enum: ["PLANNED", "RELEASED", "STARTED", "PAUSED", "COMPLETED", "CANCELLED", "CLOSED"], 
      default: "PLANNED" 
    },
    
    // References
    customerId: { type: String },
    customerName: { type: String },
    customerOrderId: { type: String }, // Customer PO reference
    bomId: { type: String },
    bomNumber: { type: String },
    enquiryId: { type: String },
    quotationId: { type: String },
    
    // Product Information
    productName: { type: String, required: true, trim: true },
    productCode: { type: String, required: true, trim: true },
    productDescription: { type: String },
    drawingNumber: { type: String, trim: true },
    revision: { type: String, default: "1.0" },
    
    // Quantities
    plannedQuantity: { type: Number, required: true, min: 1 },
    completedQuantity: { type: Number, default: 0, min: 0 },
    rejectedQuantity: { type: Number, default: 0, min: 0 },
    scrapQuantity: { type: Number, default: 0, min: 0 },
    reworkQuantity: { type: Number, default: 0, min: 0 },
    uom: { type: String, required: true },
    
    // Dates
    plannedStartDate: { type: Date, required: true },
    plannedEndDate: { type: Date, required: true },
    actualStartDate: { type: Date },
    actualEndDate: { type: Date },
    dueDate: { type: Date },
    
    // Resources and Operations
    operations: [WorkOrderOperationSchema],
    resources: [WorkOrderResourceSchema],
    
    // Costs
    plannedCost: { type: Number, default: 0, min: 0 },
    actualCost: { type: Number, default: 0, min: 0 },
    materialCost: { type: Number, default: 0, min: 0 },
    laborCost: { type: Number, default: 0, min: 0 },
    overheadCost: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    
    // Additional Information
    department: { type: String, trim: true },
    workCenter: { type: String, trim: true },
    shift: { type: String, enum: ["DAY", "NIGHT", "GENERAL"], default: "DAY" },
    specialInstructions: { type: String },
    routingInstructions: { type: String },
    qualityPlan: { type: String },
    
    // Tracking
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    lastOperationCompleted: { type: String },
    currentOperation: { type: String },
    nextOperation: { type: String },
    
    // Attachments
    attachments: [{
      id: { type: String, required: true },
      originalName: { type: String, required: true },
      filename: { type: String, required: true },
      mimetype: { type: String, required: true },
      size: { type: Number, required: true },
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: String },
      description: { type: String },
      category: { 
        type: String, 
        enum: ["DRAWING", "SPECIFICATION", "PHOTO", "REPORT", "OTHER"], 
        default: "OTHER" 
      }
    }],
    
    // Audit fields
    createdBy: { type: String, required: true },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    closedBy: { type: String },
    closedDate: { type: Date },
    
    // Company reference
    myCompanyName: { type: String },
  },
  { timestamps: true }
);

// Add indexes for performance
WorkOrderSchema.index({ workOrderNumber: 1 });
WorkOrderSchema.index({ status: 1 });
WorkOrderSchema.index({ customerId: 1 });
WorkOrderSchema.index({ bomId: 1 });
WorkOrderSchema.index({ plannedStartDate: 1 });
WorkOrderSchema.index({ dueDate: 1 });

// Prevent OverwriteModelError
const WorkOrderModel = mongoose.models.WorkOrder || model("WorkOrder", WorkOrderSchema);

export default WorkOrderModel;
