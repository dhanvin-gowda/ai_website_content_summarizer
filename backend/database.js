import mongoose from 'mongoose';

const globalForMongoose = globalThis;
const cached = globalForMongoose.__mongooseCache || { conn: null, promise: null };

globalForMongoose.__mongooseCache = cached;

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(uri).then((conn) => conn);
    }

    cached.conn = await cached.promise;
    console.log(`MongoDB connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    cached.promise = null;
    throw error;
  }
};

export default connectDB;
