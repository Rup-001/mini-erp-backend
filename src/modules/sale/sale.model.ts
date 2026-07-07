import mongoose, { Document, Types } from 'mongoose';

export interface ISaleItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ISale {
  items: ISaleItem[];
  grandTotal: number;
  soldBy: Types.ObjectId;
  createdAt: Date;
}

export interface ISaleDocument extends ISale, Document {
  id: string;
}

const saleItemSchema = new mongoose.Schema<ISaleItem>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema<ISaleDocument>(
  {
    items: { type: [saleItemSchema], required: true, validate: [(v: ISaleItem[]) => v.length > 0, 'At least one item required'] },
    grandTotal: { type: Number, required: true, min: 0 },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

saleSchema.index({ createdAt: -1 });
saleSchema.index({ soldBy: 1 });

const Sale = mongoose.model<ISaleDocument>('Sale', saleSchema);
export default Sale;
