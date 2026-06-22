import express from "express";
import {
  sendWhatsApp,
  sendTelegram,
  updateNotificationPreferences,
  getNotificationPreferences,
  WhatsAppSchema,
  TelegramSchema,
  PreferencesSchema,
} from "../controllers/notificationController";
import { validate } from "../middleware/validate";

const router = express.Router();

router.get("/preferences", getNotificationPreferences);
router.put("/preferences", validate(PreferencesSchema, "body"), updateNotificationPreferences);
router.post("/whatsapp", validate(WhatsAppSchema, "body"), sendWhatsApp);
router.post("/telegram", validate(TelegramSchema, "body"), sendTelegram);

export default router;
