/**
 * Main backend server entry point for NightSpider Interview Prep App.
 * Express server with auth, sessions, AI (Gemini) integration, MongoDB.
 * Run with `npm run dev`.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database-config.js";

import authRoutes from "./routes/auth-route.js";
import sessionRoutes from "./routes/session-route.js";
import aiRoutes from "./routes/ai-route.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, ""));

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow non-browser clients (curl/postman/server-to-server)
  const normalizedOrigin = origin.trim().replace(/\/+$/, "");
  return (
    allowedOrigins.includes(normalizedOrigin) ||
    normalizedOrigin.endsWith(".vercel.app")
  );
};

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }

  // Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      optionsSuccessStatus: 200,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/sessions", sessionRoutes);
  app.use("/api/ai", aiRoutes);

  // Root route for deployed backend URL checks
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "NightSpider backend is running",
      endpoints: {
        health: "/health",
        auth: "/api/auth",
        sessions: "/api/sessions",
        ai: "/api/ai",
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Health check
  app.get("/health", (req, res) =>
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() }),
  );

  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  });

  // 404 handler - after all routes
  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  });

  const port = process.env.PORT || 9000;
  app.listen(port, () => {
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });
};

startServer();
