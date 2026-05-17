// GET    /api/items/:id  — get one item
// PUT    /api/items/:id  — update used quantity
// DELETE /api/items/:id  — delete item

import connectDB from '../lib/db.js';
import Item      from '../models/Item.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  const { id } = req.query;

  // ── GET ONE ────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const item = await Item.findById(id);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }

  // ── UPDATE ─────────────────────────────────────────────
  } else if (req.method === 'PUT') {
    try {
      const { usedQuantity } = req.body;
      const item = await Item.findById(id);

      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      if (usedQuantity > item.quantityReceived) {
        return res.status(400).json({
          success: false,
          message: 'Used quantity cannot exceed original quantity',
        });
      }

      item.usedQuantity = usedQuantity;
      const updated = await item.save(); // pre-save middleware recalculates everything

      res.status(200).json({ success: true, message: '✅ Item updated', data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }

  // ── DELETE ─────────────────────────────────────────────
  } else if (req.method === 'DELETE') {
    try {
      const item = await Item.findByIdAndDelete(id);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      res.status(200).json({ success: true, message: `🗑️ "${item.itemName}" deleted` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}