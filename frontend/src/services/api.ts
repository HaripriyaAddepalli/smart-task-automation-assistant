import axios from "axios";
import { auth } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  aiInsights?: string;
  userId?: string;
  workspaceId?: string;
  subtasks?: Array<{ title: string; estimatedMinutes: number; completed: boolean }>;
  priorityScore?: number;
  priorityLabel?: "Urgent" | "High" | "Medium" | "Low";
  createdAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
}

export interface KanbanAssignment {
  _id: string;
  taskId: Task | string;
  column: "todo" | "in-progress" | "done";
  order: number;
  assigneeEmail: string;
  status: string;
}

export interface KanbanBoard {
  todo: KanbanAssignment[];
  "in-progress": KanbanAssignment[];
  done: KanbanAssignment[];
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  tasksCompleted: number;
  badges: Array<{ id: string; name: string; earnedAt: string }>;
}

export interface PrioritizedTask {
  title: string;
  description?: string;
  dueDate: string;
  priorityLabel: "Urgent" | "High" | "Medium" | "Low";
  priorityScore: number;
  subtasks: Array<{ title: string; estimatedMinutes: number }>;
  reasoning: string;
  conflicts?: Array<{ message: string; conflictDueDates: string[] }>;
}

export interface PrioritizeResponse {
  prioritizedTasks: PrioritizedTask[];
  globalWarnings?: string[];
}

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority: Task["priority"];
  workspaceId?: string;
};
export type UpdateTaskPayload = Partial<
  Pick<Task, "status" | "title" | "description" | "priority" | "dueDate" | "aiInsights">
>;

export const getTasks = (workspaceId?: string) =>
  api.get<Task[]>("/tasks", { params: workspaceId ? { workspaceId } : {} });
export const createTask = (taskData: CreateTaskPayload) => api.post<Task>("/tasks", taskData);
export const updateTask = (id: string, taskData: UpdateTaskPayload) =>
  api.put<Task>(`/tasks/${id}`, taskData);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
export const applyPrioritization = (prioritizedTasks: PrioritizedTask[]) =>
  api.post("/tasks/apply-prioritization", { prioritizedTasks });
export const prioritizeTasks = (tasks: Array<{ title: string; description?: string; dueDate?: string; priority?: Task["priority"] }>) =>
  api.post<PrioritizeResponse>("/ai/prioritize", { tasks });

export const getWorkspaces = () => api.get<Workspace[]>("/workspaces");
export const createWorkspace = (data: { name: string; description?: string }) =>
  api.post<Workspace>("/workspaces", data);
export const getKanbanBoard = (workspaceId: string) =>
  api.get<KanbanBoard>(`/workspaces/${workspaceId}/kanban`);
export const moveKanbanTask = (
  workspaceId: string,
  assignmentId: string,
  data: { column: "todo" | "in-progress" | "done"; order: number }
) => api.put(`/workspaces/${workspaceId}/kanban/${assignmentId}`, data);
export const inviteMember = (workspaceId: string, inviteEmail: string) =>
  api.post(`/workspaces/${workspaceId}/invite`, { inviteEmail });
export const assignTask = (workspaceId: string, taskId: string, assigneeEmail: string) =>
  api.post(`/workspaces/${workspaceId}/assign`, { taskId, assigneeEmail });

export const getMyStats = (workspaceId?: string) =>
  api.get<UserStats>("/gamification/me", { params: workspaceId ? { workspaceId } : {} });
export const getLeaderboard = (workspaceId?: string) =>
  api.get("/gamification/leaderboard", { params: workspaceId ? { workspaceId } : {} });

export const getIntegrationStatus = () => api.get("/integrations/status");
export const triggerEmailDigest = () => api.post("/integrations/email-digest");
export const connectGoogleCalendar = () => api.post<{ authUrl: string }>("/integrations/google-calendar");
export const syncGoogleCalendar = () => api.post("/integrations/google-calendar/sync");
export const disconnectGoogleCalendar = () => api.delete("/integrations/google-calendar");

export const getNotificationPreferences = () => api.get("/notifications/preferences");
export const updateNotificationPreferences = (prefs: Record<string, unknown>) =>
  api.put("/notifications/preferences", prefs);

export const getSubscriptionInfo = () => api.get("/billing/subscription");
export const createCheckout = (plan: "pro" | "team") =>
  api.post<{ url: string }>("/billing/checkout", { plan });
export const createBillingPortal = () => api.post<{ url: string }>("/billing/portal");

export const aiChat = (message: string) => api.post<{ reply: string }>("/ai/chat", { message });

export const completeOnboarding = () =>
  api.put("/auth/onboarding", { completed: true }).catch(() => {
    localStorage.setItem("onboardingCompleted", "true");
  });
