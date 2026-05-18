import express from "express";
import { handleVoiceCommand } from "../services/voiceCommandService";

const router = express.Router();

router.post("/command", async (req, res) => {
  try {
    const { text } = req.body;

    const result = await handleVoiceCommand(text);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Voice command failed" });
  }
});

export default router;