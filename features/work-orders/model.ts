import mongoose, { Schema, model } from "mongoose";

// WorkOrder Item Schema - for Part No/Part Name/Revision Level/Qty
const WorkOrderItemSchema = new Schema({
  itemNo: { type: String, required: true, trim: true }, // Part No
  itemName: { type: String, required: true, trim: true }, // Part Name  
  revisionLevel: { type: String, trim: true }, // Revision Level
  qty: { type: Number, required: true, min: 1 }, // Quantity
});

const WorkOrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    
    // Core fields based on Excel structure
    status: { 
      type: String, 
      enum: ["Open", "Closed", "Short Closed", "On Hold"], 
      default: "Open" 
    },
    customerId: { type: String, required: true, trim: true }, // Customer Name/ID
    customerName: { type: String, required: true, trim: true }, // Customer Name
    orderType: { type: String, required: true, trim: true }, // Order Type (Manufacture, etc.)
    poId: { type: String, trim: true }, // PO Ref No
    poDate: { type: Date }, // PO REL. DATE
    targetDate: { type: Date, required: true }, // TARGET DATE (Delivery Date)
    
    // Work Order specific fields
    workOrderId: { type: String, unique: true }, // WO number (auto-generated: 000001, 000002, etc.)
    projectName: { type: String, required: true, trim: true }, // PROJECT NAME
    
    // Items array - contains Part Nos, Part Names, Revision Levels, Quantities
    items: [WorkOrderItemSchema],
    
    // Progress tracking
    startDate: { type: Date }, // Start Date
    progress: { type: Number, default: 0, min: 0, max: 100 }, // Progress percentage
    totalPlannedQty: { type: Number, default: 0, min: 0 }, // Total Planned Quantity
    completedQty: { type: Number, default: 0, min: 0 }, // Completed Quantity
    
    // Additional tracking fields
    dispatchDate: { type: Date }, // DISPATCH DATE from Excel
    year: { type: Number }, // Year from Excel
    month: { type: Number }, // Month from Excel  
    day: { type: Number }, // Day from Excel
    
    // Audit fields
    createdBy: { type: String, required: true },
    updatedBy: { type: String },
    
    // Company reference
    myCompanyName: { type: String },
    
    // Optional notes
    notes: { type: String },
  },
  { timestamps: true }
);

// Pre-save middleware to auto-generate workOrderId
WorkOrderSchema.pre('save', function(next) {
  if (this.isNew && !this.workOrderId) {
    // Generate workOrderId in format: 000001, 000002, etc.
    // This should ideally query the database for the last number, but for now we'll use timestamp-based
    const timestamp = Date.now().toString().slice(-6);
    this.workOrderId = timestamp.padStart(6, '0');
  }
  
  // Auto-calculate year, month, day from targetDate
  if (this.targetDate) {
    const date = new Date(this.targetDate);
    this.year = date.getFullYear();
    this.month = date.getMonth() + 1; // JS months are 0-based
    this.day = date.getDate();
  }
  
  next();
});

// Add indexes for performance
WorkOrderSchema.index({ workOrderId: 1 });
WorkOrderSchema.index({ status: 1 });
WorkOrderSchema.index({ customerId: 1 });
WorkOrderSchema.index({ targetDate: 1 });
WorkOrderSchema.index({ projectName: 1 });
WorkOrderSchema.index({ createdAt: 1 });

// Prevent OverwriteModelError
const WorkOrderModel = mongoose.models.WorkOrder || model("WorkOrder", WorkOrderSchema);

export default WorkOrderModel;
