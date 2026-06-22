import express from "express";
import {
  triggerEmailDigest,
  googleCalendarConnect,
  googleCalendarCallback,
  googleCalendarSync,
  googleCalendarDisconnect,
  getIntegrationStatus,
} from "../controllers/integrationController";

const router = express.Router();

router.get("/status", getIntegrationStatus);
router.post("/email-digest", triggerEmailDigest);
router.post("/google-calendar", googleCalendarConnect);
router.get("/google-calendar/callback", googleCalendarCallback);
router.post("/google-calendar/sync", googleCalendarSync);
router.delete("/google-calendar", googleCalendarDisconnect);

export default router;
