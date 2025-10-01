import mongoose, { Schema, Document, Model } from 'mongoose';
import { Operation } from './schemas';

const operationSchema = new Schema({
  id: { type: String },
  process: { 
    type: String, 
    required: true, 
    trim: true,
    // Examples: Casting, Machining, Assembly, etc.
  },
  workCenter: { 
    type: String, 
    required: true, 
    trim: true,
    // Examples: Foundry-01, CNC-Machine-02, Assembly-Line-01, etc.
  },
  rawMaterials: {
    type: [{
      itemId: { type: String, required: true }, // Reference to Item model
      itemCode: { type: String, required: true },
      itemDescription: { type: String, required: true },
      quantity: { type: Number, required: true, min: 0 },
      uom: { type: String, required: true },
    }],
    default: []
  },
  setupMinutes: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  cncMinutesEstimate: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  totalMinutesEstimate: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total minutes automatically
operationSchema.pre('save', function(next) {
  this.totalMinutesEstimate = this.setupMinutes + this.cncMinutesEstimate;
  next();
});

// Add indexes for better query performance
operationSchema.index({ process: 1, workCenter: 1 });
operationSchema.index({ createdAt: -1 });

interface IOperation extends Document, Omit<Operation, 'id'> {}

const OperationModel: Model<IOperation> =
  mongoose.models.Operation ||
  mongoose.model<IOperation>('Operation', operationSchema);

export default OperationModel;