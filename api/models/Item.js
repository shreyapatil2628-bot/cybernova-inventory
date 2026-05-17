// Item.js — MongoDB schema for inventory items

import mongoose from 'mongoose';

// Prevent re-compiling model on every serverless function cold start
if (mongoose.models.Item) {
  export default mongoose.model('Item');
}

const itemSchema = new mongoose.Schema(
  {
    itemId:            { type: String, required: true, unique: true, trim: true },
    itemName:          { type: String, required: true, trim: true },
    description:       { type: String, default: '' },
    itemType: {
      type: String,
      required: true,
      enum: ['Electronics','Furniture','Stationery','Raw Material',
             'Finished Goods','Consumables','Machinery','Other'],
    },
    quantityReceived:  { type: Number, required: true, min: 0 },
    usedQuantity:      { type: Number, default: 0, min: 0 },
    remainingQuantity: { type: Number, default: 0 },
    dateAdded:         { type: Date, default: Date.now },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
  },
  { timestamps: true }
);

// Auto-calculate remaining qty and stock status before every save
itemSchema.pre('save', function (next) {
  this.remainingQuantity = this.quantityReceived - this.usedQuantity;

  if (this.remainingQuantity <= 0)       this.stockStatus = 'Out of Stock';
  else if (this.remainingQuantity <= 10) this.stockStatus = 'Low Stock';
  else                                   this.stockStatus = 'In Stock';

  next();
});

export default mongoose.model('Item', itemSchema);