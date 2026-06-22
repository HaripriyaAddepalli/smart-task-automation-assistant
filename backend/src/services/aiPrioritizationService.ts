import Groq from "groq-sdk";
import { z } from "zod";
import { cacheGet, cacheSet, buildAiCacheKey } from "../config/redis";

const client = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;


const PRIORITIZE_TASK_INPUT = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  // Existing app uses low/medium/high; allow that for forward compat.
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const PRIORITIZE_REQUEST = z.object({
  tasks: z.array(PRIORITIZE_TASK_INPUT).min(1),
  // Optional context for better prioritization. Keep minimal for v1.
  userHistory: z
    .object({
      completedOnTimeRatio: z.number().min(0).max(1).optional(),
      typicalWorkHoursPerDay: z.number().positive().optional(),
    })
    .optional(),
});

const PRIORITIZATION_OUTPUT = z.object({
  // Re-ranked tasks with AI reasoning
  prioritizedTasks: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.string().datetime(),
        // Production requirement: Urgent / High / Medium / Low
        priorityLabel: z.enum(["Urgent", "High", "Medium", "Low"]),
        priorityScore: z.number().int().min(0).max(100),
        subtasks: z
          .array(
            z.object({
              title: z.string(),
              estimatedMinutes: z.number().int().min(1).max(10000),
            })
          )
          .min(0)
          .max(50),
        conflicts: z
          .array(
            z.object({
              message: z.string(),
              conflictDueDates: z.array(z.string().datetime()).min(1),
            })
          )
          .optional(),
        reasoning: z.string().max(1200),
      })
    )
    .min(1),
  globalWarnings: z.array(z.string()).optional(),
});

export type PrioritizeRequest = z.infer<typeof PRIORITIZE_REQUEST>;
export type PrioritizeResponse = z.infer<typeof PRIORITIZATION_OUTPUT>;

export const prioritizeTasks = async (reqBody: unknown): Promise<PrioritizeResponse> => {
  const parsedReq = PRIORITIZE_REQUEST.parse(reqBody);

  const cacheKey = buildAiCacheKey("prioritize", parsedReq);
  const cached = await cacheGet<PrioritizeResponse>(cacheKey);
  if (cached) return cached;

  const tasksForPrompt = parsedReq.tasks.map((t) => ({
    title: t.title,
    description: t.description,
    dueDate: t.dueDate,
    priority: t.priority,
  }));

  const prompt = `You are a production-grade productivity assistant. Re-rank and rewrite tasks into a realistic plan.

Input tasks:
${JSON.stringify(tasksForPrompt, null, 2)}

Rules:
1) For any task missing dueDate, suggest a realistic ISO datetime dueDate in the near future (no more than 21 days from now).
2) Assign priorityScore (0-100) and priorityLabel (Urgent/High/Medium/Low) based on deadline proximity, semantic urgency keywords ("urgent", "asap", "today", "deadline"), and provided priorities.
3) Break large tasks into subtasks. Each subtask must have estimatedMinutes (1..10000). Provide 2-8 subtasks per task.
4) Detect conflicting deadlines: if two tasks have due dates that are too close to be realistic given user typical pace, set conflicts for affected tasks.
   - You may use a heuristic: if multiple tasks have dueDate within 24 hours, mark as conflict.
5) Output MUST be valid JSON matching the schema described by the system message.

Return ONLY JSON.`;

  if (!client) {
    // Allow local/dev/test runs without secrets.
    // Deterministic fallback that still satisfies the schema.
    const now = Date.now();
    const prioritizedTasks = parsedReq.tasks.map((t, idx) => {
      const due = t.dueDate ? new Date(t.dueDate) : new Date(now + (idx + 1) * 24 * 60 * 60 * 1000);
      const score = t.priority === "high" ? 90 : t.priority === "medium" ? 60 : 30;
      const label = t.priority === "high" ? "Urgent" : t.priority === "medium" ? "High" : "Medium";
      return {
        title: t.title,
        description: t.description,
        dueDate: due.toISOString(),
        priorityLabel: label as "Urgent" | "High" | "Medium" | "Low",
        priorityScore: score,
        subtasks: [
          { title: "Plan", estimatedMinutes: 30 },
          { title: "Execute", estimatedMinutes: 60 },
        ],
        conflicts: [],
        reasoning: "Fallback prioritization (missing GROQ_API_KEY).",
      };
    });

    const result = PRIORITIZATION_OUTPUT.parse({ prioritizedTasks, globalWarnings: ["GROQ_API_KEY not set; using fallback prioritization"] });
    await cacheSet(cacheKey, result, 3600);
    return result;
  }

  const response = await client.chat.completions.create({

    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "Return JSON only. Schema: { prioritizedTasks: [{ title, description?, dueDate (ISO datetime), priorityLabel: 'Urgent'|'High'|'Medium'|'Low', priorityScore (0-100), subtasks: [{ title, estimatedMinutes }], conflicts?: [{ message, conflictDueDates: [ISO datetime] }], reasoning: string }], globalWarnings?: string[] }",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 900,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";

  // Models sometimes return extra text; attempt to salvage JSON.
  const jsonCandidate = raw.trim().match(/\{[\s\S]*\}/)?.[0] ?? raw;
  const parsed = JSON.parse(jsonCandidate) as unknown;

  const result = PRIORITIZATION_OUTPUT.parse(parsed);
  await cacheSet(cacheKey, result, 3600);
  return result;
};

