// db.js — Reusable MongoDB connection for serverless functions
// Serverless functions can run many times, so we cache the connection

import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If already connected, return existing connection
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;