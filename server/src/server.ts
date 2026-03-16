import app from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDb();
    console.log("✅ MongoDB connected successfully");

    const server = app.listen(env.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 CDGI No-Dues Backend Server                          ║
║                                                            ║
║   Running on: ${env.baseUrl.padEnd(50)}║
║   Frontend:   ${env.frontendUrl.padEnd(50)}║
║   Environment: ${env.nodeEnv.padEnd(49)}║
║                                                            ║
║   📚 Database: Connected                                  ║
║   🔐 JWT:      Configured                                 ║
║   📧 Email:    ${env.emailUser.split('@')[0].padEnd(49)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
