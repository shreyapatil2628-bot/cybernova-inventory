// GET /api/items/stats — Dashboard statistics

import connectDB from '../lib/db.js';
import Item      from '../models/Item.js';

export default async function handler(req, res) {
  // Allow frontend to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const totalItems  = await Item.countDocuments();
    const lowStock    = await Item.countDocuments({ stockStatus: 'Low Stock' });
    const outOfStock  = await Item.countDocuments({ stockStatus: 'Out of Stock' });
    const recentItems = await Item.find().sort({ createdAt: -1 }).limit(5);

    const agg = await Item.aggregate([
      { $group: { _id: null, total: { $sum: '$remainingQuantity' } } }
    ]);
    const totalQuantity = agg[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: { totalItems, lowStock, outOfStock, totalQuantity, recentItems },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}