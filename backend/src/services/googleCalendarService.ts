import { google } from "googleapis";
import User from "../models/User";
import Task from "../models/Task";
import logger from "../config/logger";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:5000/api/integrations/google-calendar/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const getGoogleAuthUrl = (userId: string): string => {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: userId,
    prompt: "consent",
  });
};

export const handleGoogleCallback = async (code: string, userId: string): Promise<void> => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  await User.findOneAndUpdate(
    { firebaseUid: userId },
    {
      googleCalendarTokens: {
        accessToken: tokens.access_token ?? "",
        refreshToken: tokens.refresh_token ?? "",
        expiryDate: tokens.expiry_date ?? Date.now() + 3600000,
      },
    }
  );
  logger.info({ message: "Google Calendar connected", userId });
};

const getAuthenticatedClient = async (userId: string) => {
  const user = await User.findOne({ firebaseUid: userId });
  if (!user?.googleCalendarTokens) {
    throw new Error("Google Calendar not connected");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.googleCalendarTokens.accessToken,
    refresh_token: user.googleCalendarTokens.refreshToken,
    expiry_date: user.googleCalendarTokens.expiryDate,
  });

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        {
          "googleCalendarTokens.accessToken": tokens.access_token,
          ...(tokens.expiry_date && { "googleCalendarTokens.expiryDate": tokens.expiry_date }),
        }
      );
    }
  });

  return oauth2Client;
};

export const syncTasksToCalendar = async (userId: string): Promise<{ synced: number }> => {
  const auth = await getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const tasks = await Task.find({
    userId,
    status: { $ne: "completed" },
    dueDate: { $exists: true },
  });

  let synced = 0;
  for (const task of tasks) {
    if (!task.dueDate) continue;

    const start = new Date(task.dueDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: task.title,
        description: task.description ?? "",
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
    });
    synced++;
  }

  logger.info({ message: "Calendar sync complete", userId, synced });
  return { synced };
};

export const disconnectGoogleCalendar = async (userId: string): Promise<void> => {
  await User.findOneAndUpdate(
    { firebaseUid: userId },
    { $unset: { googleCalendarTokens: 1 } }
  );
};
