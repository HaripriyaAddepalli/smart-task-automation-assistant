import express from "express";
import Groq from "groq-sdk";
import { asyncHandler } from "../middleware/asyncHandler";
import prioritizeAiRoutes from "./prioritizeAiRoutes";

const router = express.Router();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      max_tokens: 300,
    });
    res.json({
      reply: response.choices[0]?.message?.content || "No response",
    });
  })
);

router.use("/", prioritizeAiRoutes);

export default router;

