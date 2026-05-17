// GET /api/items  — get all items (with search/filter/pagination)
// POST /api/items — create new item

import connectDB from '../lib/db.js';
import Item      from '../models/Item.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  // ── GET ALL ITEMS ──────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { type, status, search, sort, page = 1, limit = 10 } = req.query;
      let filter = {};

      if (type)   filter.itemType    = type;
      if (status) filter.stockStatus = status;
      if (search) {
        filter.$or = [
          { itemName: { $regex: search, $options: 'i' } },
          { itemId:   { $regex: search, $options: 'i' } },
        ];
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'name')     sortOption = { itemName: 1 };
      if (sort === 'quantity') sortOption = { remainingQuantity: 1 };
      if (sort === 'oldest')   sortOption = { createdAt: 1 };

      const skip  = (parseInt(page) - 1) * parseInt(limit);
      const total = await Item.countDocuments(filter);
      const items = await Item.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit));

      res.status(200).json({
        success: true, total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        data: items,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }

  // ── CREATE ITEM ────────────────────────────────────────
  } else if (req.method === 'POST') {
    try {
      const { itemId, itemName, description, itemType, quantityReceived, dateAdded } = req.body;

      const existing = await Item.findOne({ itemId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Item ID "${itemId}" already exists`,
        });
      }

      const item = new Item({
        itemId, itemName, description,
        itemType, quantityReceived,
        usedQuantity: 0,
        dateAdded: dateAdded || Date.now(),
      });

      const saved = await item.save();
      res.status(201).json({
        success: true,
        message: `✅ "${itemName}" added successfully`,
        data: saved,
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        const msgs = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: msgs.join(', ') });
      }
      res.status(500).json({ success: false, message: err.message });
    }

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}