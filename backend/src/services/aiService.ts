import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const processTaskRequest = async (prompt: string) => {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Extract structured task data (title, description, priority: low/medium/high, dueDate if any) from this:\n${prompt}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 400,
    });

    return response.choices[0]?.message?.content || "{}";
  } catch (error) {
    console.error("AI Processing Error:", error);
    throw new Error("Failed to process task with AI");
  }
};

export const generateTaskInsights = async (taskDetails: any) => {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `Give a short helpful productivity tip for this task:\n${JSON.stringify(taskDetails)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "No insights available";
  } catch (error) {
    console.error("Insight Error:", error);
    return "Could not generate insights";
  }
};