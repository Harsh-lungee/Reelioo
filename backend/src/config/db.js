import dns from "node:dns";
import mongoose from "mongoose";

export default async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes("<")) {
    console.warn("MongoDB not connected: add a real MONGO_URI value to backend/.env.");
    return null;
  }

  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  const connection = await mongoose.connect(mongoUri);

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
}
