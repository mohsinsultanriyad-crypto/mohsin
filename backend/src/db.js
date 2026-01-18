import mongoose from "mongoose";

export async function connectDB(MONGO_URL) {
  if (!MONGO_URL) throw new Error("MONGO_URL missing");

  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URL);

  console.log("✅ MongoDB connected");
}
