import 'dotenv/config';
import app from '../backend/app.js';
import connectDB from '../backend/database.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    const status = error.message === 'MONGODB_URI is not configured' ? 500 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}