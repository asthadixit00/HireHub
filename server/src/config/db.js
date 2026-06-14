// server/src/config/db.js
// PURPOSE: Establish and manage MongoDB connection.
// WHY SEPARATE FILE: If connection fails, we want the
// error in one place. Also reusable in tests.

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit process if DB fails — server is useless without DB
  }
};

export default connectDB;