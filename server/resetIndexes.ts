import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://mayur:Mayur123@cluster0.2z0qf.mongodb.net/campusclear?retryWrites=true&w=majority";

async function cleanDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Clear the users collection completely
    console.log("Clearing users collection...");
    await db.collection("users").deleteMany({});
    console.log("✅ Deleted all users");

    // Clear the nodues collection completely
    console.log("Clearing nodues collection...");
    await db.collection("nodues").deleteMany({});
    console.log("✅ Deleted all no-dues records");

    // Clear the audit logs
    console.log("Clearing audit logs...");
    await db.collection("auditlogs").deleteMany({});
    console.log("✅ Deleted all audit logs");

    // Drop all indexes
    console.log("Dropping all indexes from users collection...");
    try {
      await db.collection("users").dropIndexes();
      console.log("✅ Dropped all indexes");
    } catch (err: any) {
      if (err.message.includes("index not found")) {
        console.log("⚠️  No indexes to drop");
      }
    }

    // Recreate indexes based on User schema
    console.log("Recreating indexes...");
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("✅ Created unique index on email");
    
    await db.collection("users").createIndex({ enrollmentNo: 1 }, { sparse: true, unique: true });
    console.log("✅ Created unique sparse index on enrollmentNo");
    
    await db.collection("users").createIndex({ role: 1 });
    console.log("✅ Created index on role");

    console.log("\n✅ Database cleaned successfully! All collections cleared.");
    console.log("You can now register fresh users without conflicts.\n");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanDatabase();

