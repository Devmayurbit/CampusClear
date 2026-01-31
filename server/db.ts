import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URI not found in .env file");
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Atlas Connected Successfully");
    
    // Fix stale indexes
    await fixIndexes();
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
}

async function fixIndexes() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const usersCollection = db.collection("users");
    
    // Drop the problematic rollNumber_1 index if it exists
    try {
      await usersCollection.dropIndex("rollNumber_1");
      console.log("✅ Dropped stale rollNumber_1 index");
    } catch (err: any) {
      // Index might not exist, that's fine
      if (!err.message.includes("index not found")) {
        console.warn("⚠️  Issue dropping rollNumber index:", err.message);
      }
    }
  } catch (error) {
    console.warn("⚠️  Could not fix indexes:", error);
    // Don't fail on index issues, just warn
  }
}
