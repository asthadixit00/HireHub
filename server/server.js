// server/server.js
// PURPOSE: This is the entry point of our application.
// It imports the configured Express app and starts
// the HTTP server on a specific port.
// WHY SEPARATE FROM app.js: So we can import 'app' in
// tests without actually starting the server.
/*
import app from './src/app.js';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ MongoDB connected`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
*/
import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});