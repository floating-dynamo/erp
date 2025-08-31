import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI && process.env.NEXT_PUBLIC_APP_MOCK_API !== 'true') {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let isConnected = false;

export const connectDB = async () => {
  // Skip database connection when using mock API
  if (process.env.NEXT_PUBLIC_APP_MOCK_API === 'true') {
    console.log("Using mock API - skipping database connection");
    return;
  }

  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", (error as Error).message);
    throw new Error("Failed to connect to MongoDB");
  }
};
