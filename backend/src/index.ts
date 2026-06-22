import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";

import connectDB from "./config/db";
import { connectRedis } from "./config/redis";

import taskRoutes from "./routes/taskRoutes";
import aiRoutes from "./routes/aiRoutes";
import emailRoutes from "./routes/emailRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import voiceRoutes from "./routes/voiceRoutes";
import authRoutes from "./routes/authRoutes";
import authActionRoutes from "./routes/authActionRoutes";
import workspaceRoutes from "./routes/workspaceRoutes";
import integrationRoutes from "./routes/integrationRoutes";
import gamificationRoutes from "./routes/gamificationRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import stripeRoutes from "./routes/stripeRoutes";

import { startDigestEmailJob, startDeadlineReminderJob } from "./services/digestEmailService";
import { startNotificationJobs } from "./services/notificationJobService";
import { initTelegramBot } from "./services/telegramService";
import { initSocket } from "./services/socketService";
import { stripeWebhook } from "./controllers/stripeController";

import logger from "./config/logger";
import { limiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/requireAuth";
import { subscriptionGuard } from "./middleware/subscriptionGuard";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "*",
    credentials: true,
  })
);
app.use(helmet());

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use(limiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", authActionRoutes);

app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/ai", requireAuth, subscriptionGuard("ai"), aiRoutes);
app.use("/api/email", requireAuth, emailRoutes);
app.use("/api/analytics", requireAuth, analyticsRoutes);
app.use("/api/voice", requireAuth, voiceRoutes);
app.use("/api/workspaces", requireAuth, workspaceRoutes);
app.use(
  "/api/integrations",
  requireAuth,
  subscriptionGuard("integrations"),
  integrationRoutes
);
app.use("/api/gamification", requireAuth, gamificationRoutes);
app.use("/api/notifications", requireAuth, notificationRoutes);
app.use("/api/billing", requireAuth, stripeRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    logger.info("MongoDB Connected");

    connectRedis();
    initTelegramBot();

    startDigestEmailJob();
    startDeadlineReminderJob();
    startNotificationJobs();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      logger.info({ message: `Server running on port ${PORT}` });
      logger.info({
        "GROQ KEY": process.env.GROQ_API_KEY ? "LOADED ✅" : "MISSING ❌",
      });
    });
  } catch (error) {
    logger.error({ message: "Server startup error", error });
  }
};

startServer();
