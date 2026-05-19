import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  aiInsights?: string;
  createdAt: string;
}

export const getTasks = () => api.get<Task[]>('/tasks');
export type CreateTaskPayload = { title: string; description?: string; priority: Task["priority"] };
export type UpdateTaskPayload = Partial<Pick<Task, "status" | "title" | "description" | "priority" | "dueDate" | "aiInsights">>;

export const createTask = (taskData: CreateTaskPayload) => api.post<Task>('/tasks', taskData);
export const updateTask = (id: string, taskData: UpdateTaskPayload) => api.put<Task>(`/tasks/${id}`, taskData);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
