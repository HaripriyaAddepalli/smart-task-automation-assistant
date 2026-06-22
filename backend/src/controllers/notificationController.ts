import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { validate } from "../middleware/validate";
import User from "../models/User";
import { sendWhatsAppNotification } from "../services/whatsappService";
import { sendTelegramNotification } from "../services/telegramService";

const WhatsAppSchema = z.object({
  phoneNumber: z.string().min(10),
  message: z.string().min(1).max(1000),
});

const TelegramSchema = z.object({
  chatId: z.string().min(1),
  message: z.string().min(1).max(1000),
});

const PreferencesSchema = z.object({
  emailDigest: z.boolean().optional(),
  deadlineReminders: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  whatsappNumber: z.string().optional(),
  telegramEnabled: z.boolean().optional(),
  telegramChatId: z.string().optional(),
  assignmentAlerts: z.boolean().optional(),
  streakMilestones: z.boolean().optional(),
});

export const sendWhatsApp = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { phoneNumber, message } = req.body as z.infer<typeof WhatsAppSchema>;

  await User.findOneAndUpdate(
    { firebaseUid: uid },
    {
      "notificationPreferences.whatsappEnabled": true,
      "notificationPreferences.whatsappNumber": phoneNumber,
    },
    { upsert: true }
  );

  const sid = await sendWhatsAppNotification(phoneNumber, "Smart Task Assistant", message);
  res.json({ success: true, sid });
});

export const sendTelegram = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { chatId, message } = req.body as z.infer<typeof TelegramSchema>;

  await User.findOneAndUpdate(
    { firebaseUid: uid },
    {
      "notificationPreferences.telegramEnabled": true,
      "notificationPreferences.telegramChatId": chatId,
    },
    { upsert: true }
  );

  await sendTelegramNotification(chatId, "Smart Task Assistant", message);
  res.json({ success: true });
});

export const updateNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const prefs = req.body as z.infer<typeof PreferencesSchema>;

  const updateFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined) {
      updateFields[`notificationPreferences.${key}`] = value;
    }
  }

  const user = await User.findOneAndUpdate(
    { firebaseUid: uid },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  res.json(user?.notificationPreferences);
});

export const getNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const user = await User.findOne({ firebaseUid: uid });
  res.json(user?.notificationPreferences ?? {});
});

export { WhatsAppSchema, TelegramSchema, PreferencesSchema };
