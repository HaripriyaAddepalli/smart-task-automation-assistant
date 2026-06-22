import { prioritizeTasks } from "../services/aiPrioritizationService";

// These tests are structural and will be skipped if GROQ_API_KEY is not set.
// In production CI, you can mock Groq instead.

describe("AI Prioritization Service", () => {
  it("validates and returns prioritizedTasks structure", async () => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Keep test non-flaky in environments without secrets.
      return;
    }

    const result = await prioritizeTasks({
      tasks: [
        {
          title: "Submit report by tomorrow",
          description: "Write and submit the weekly status report.",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: "Plan project milestones",
          description: "Break down milestones for next sprint.",
        },
      ],
    });

    expect(Array.isArray(result.prioritizedTasks)).toBe(true);
    expect(result.prioritizedTasks.length).toBeGreaterThan(0);
    for (const t of result.prioritizedTasks) {
      expect(["Urgent", "High", "Medium", "Low"]).toContain(t.priorityLabel);
      expect(typeof t.priorityScore).toBe("number");
      expect(t.subtasks.length).toBeGreaterThanOrEqual(0);
      expect(typeof t.reasoning).toBe("string");
      // ISO datetime
      expect(new Date(t.dueDate).toString()).not.toBe("Invalid Date");
    }
  });
});

