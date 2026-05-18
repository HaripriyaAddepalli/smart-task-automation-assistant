import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db";
import taskRoutes from "./routes/taskRoutes";
import aiRoutes from "./routes/aiRoutes";
import emailRoutes from "./routes/emailRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import voiceRoutes from "./routes/voiceRoutes";
import { startReminderService } from "./services/reminderService";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/voice", voiceRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    startReminderService();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        "GROQ KEY:",
        process.env.GROQ_API_KEY ? "LOADED ✅" : "MISSING ❌"
      );
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

startServer();