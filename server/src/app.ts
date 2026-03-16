import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Basic secure headers (no extra dependency)
app.use((_, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader("Referrer-Policy", "no-referrer");
	next();
});

app.use(cors({
	origin: process.env.FRONTEND_URL || "http://localhost:5173",
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (_, res) => {
	res.json({ status: "ok", message: "CDGI No-Dues Backend is running" });
});

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		error: "NOT_FOUND",
		message: `Route ${req.method} ${req.originalUrl} not found`,
	});
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
