import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendDailyDigestToUser } from "../services/digestEmailService";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  syncTasksToCalendar,
  disconnectGoogleCalendar,
} from "../services/googleCalendarService";
import User from "../models/User";

export const triggerEmailDigest = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const email = req.user!.email ?? "";
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  await sendDailyDigestToUser(uid, email);
  res.json({ message: "Daily digest sent" });
});

export const googleCalendarConnect = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const authUrl = getGoogleAuthUrl(uid);
  res.json({ authUrl });
});

export const googleCalendarCallback = asyncHandler(async (req: Request, res: Response) => {
  const { code, state } = req.query as { code?: string; state?: string };
  if (!code || !state) {
    res.status(400).json({ message: "Missing code or state" });
    return;
  }
  await handleGoogleCallback(code, state);
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  res.redirect(`${frontendUrl}/settings?google=connected`);
});

export const googleCalendarSync = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const result = await syncTasksToCalendar(uid);
  res.json(result);
});

export const googleCalendarDisconnect = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  await disconnectGoogleCalendar(uid);
  res.json({ message: "Google Calendar disconnected" });
});

export const getIntegrationStatus = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({
    googleCalendarConnected: Boolean(user.googleCalendarTokens?.accessToken),
    emailDigestEnabled: user.notificationPreferences.emailDigest,
    deadlineRemindersEnabled: user.notificationPreferences.deadlineReminders,
  });
});
