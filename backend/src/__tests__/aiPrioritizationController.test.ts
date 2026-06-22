import { Request, Response, NextFunction } from "express";
import { prioritizeTasksHandler } from "../controllers/aiPrioritizationController";
import * as aiPrioritizationService from "../services/aiPrioritizationService";

jest.mock("../services/aiPrioritizationService");

const mockPrioritizeTasks = aiPrioritizationService.prioritizeTasks as jest.MockedFunction<
  typeof aiPrioritizationService.prioritizeTasks
>;

describe("AI Prioritization Controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let nextMock: NextFunction;

  beforeEach(() => {
    jsonMock = jest.fn();
    nextMock = jest.fn();
    mockReq = {
      body: {
        tasks: [{ title: "Test task", description: "Do something important" }],
      },
    };
    mockRes = {
      json: jsonMock,
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("returns prioritized tasks on success", async () => {
    const mockResult = {
      prioritizedTasks: [
        {
          title: "Test task",
          dueDate: new Date().toISOString(),
          priorityLabel: "High" as const,
          priorityScore: 80,
          subtasks: [{ title: "Step 1", estimatedMinutes: 30 }],
          reasoning: "Important task with near deadline",
        },
      ],
    };
    mockPrioritizeTasks.mockResolvedValue(mockResult);

    await prioritizeTasksHandler(
      mockReq as Request,
      mockRes as Response,
      nextMock
    );

    expect(mockPrioritizeTasks).toHaveBeenCalledWith(mockReq.body);
    expect(jsonMock).toHaveBeenCalledWith(mockResult);
    expect(nextMock).not.toHaveBeenCalled();
  });

  it("forwards errors to next middleware", async () => {
    const error = new Error("Groq API failed");
    mockPrioritizeTasks.mockRejectedValue(error);

    await prioritizeTasksHandler(
      mockReq as Request,
      mockRes as Response,
      nextMock
    );

    expect(nextMock).toHaveBeenCalledWith(error);
    expect(jsonMock).not.toHaveBeenCalled();
  });
});
