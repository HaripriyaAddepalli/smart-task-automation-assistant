import express from "express";
import Groq from "groq-sdk";
import { sendEmail } from "../services/emailService";

const router = express.Router();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AUTO GENERATE + SEND EMAIL
router.post("/auto-send", async (req, res) => {
  try {
    const { task, to } = req.body;

    // 1. Generate email using AI
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `
You are a professional email writer.

Convert this task into a formal email.

Task: ${task}

Return format:
Subject: ...
Body: ...
          `,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content || "";

    // 2. Extract subject + body
    const subjectMatch = content.match(/Subject:(.*)/i);
    const bodyMatch = content.match(/Body:(.*)/is);

    const subject = subjectMatch?.[1]?.trim() || "AI Generated Email";
    const body = bodyMatch?.[1]?.trim() || content;

    // 3. Send email automatically
    await sendEmail(to, subject, body);

    res.json({
      success: true,
      message: "Email generated and sent successfully",
      subject,
      body,
    });
  } catch (error) {
    console.error("Auto Email Error:", error);
    res.status(500).json({ error: "Auto email failed" });
  }
});

export default router;