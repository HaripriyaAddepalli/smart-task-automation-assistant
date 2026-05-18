import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateTaskInsights = async (taskDetails: any) => {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Give a short, clear productivity tip for this task:\n${JSON.stringify(
            taskDetails
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "No insights available";
  } catch (error) {
    console.error("❌ Groq AI Error:", error);
    return "AI insights unavailable";
  }
};