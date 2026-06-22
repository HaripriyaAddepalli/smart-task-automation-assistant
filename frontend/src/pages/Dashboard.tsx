import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Plus, Settings, Grid3x3 } from "lucide-react";
import toast from "react-hot-toast";
import { ChatBot } from "../components/ChatBot";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import { createTask, deleteTask, getTasks, updateTask, type Task } from "../services/api";
import { KanbanBoard } from "./KanbanBoard";
import "./Dashboard.css";

const DEFAULT_WORKSPACE_ID = "";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [workspaceId] = useState<string>(DEFAULT_WORKSPACE_ID);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: voiceError,
  } = useVoiceRecognition();

  useEffect(() => {
    if (tasks.length > 0) {
      toast("You have tasks in your dashboard 🔔");
    }
  }, [tasks.length]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await getTasks(workspaceId || undefined);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [workspaceId]);

  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
    };

    void loadTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!transcript) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPrompt(transcript);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [transcript]);

  const playSound = () => {
    const audio = new Audio("/notify.mp3");
    audio.play();
  };

  const handleCreateTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      await createTask({
        title: prompt,
        description: prompt,
        priority: "medium",
        workspaceId: workspaceId || undefined,
      });
      toast.success("Task created successfully 🚀");
      playSound();

      setPrompt("");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to create task ❌");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateTask(task._id, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-top">
          <h1>AI Task Assistant</h1>
          <div className="header-actions">
            <button
              onClick={() => navigate("/workspaces")}
              className="header-button"
              title="Workspaces"
            >
              <Grid3x3 size={20} /> Workspaces
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="header-button"
              title="Settings"
            >
              <Settings size={20} /> Settings
            </button>
          </div>
        </div>
        <p>Automate your workflow with voice and AI</p>
      </header>

      <ChatBot />

      <section className="input-section">
        <form onSubmit={handleCreateTask}>
          <div className="input-group">
            <textarea
              className="task-textarea"
              placeholder="Tell the AI what to do..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`mic-button ${isListening ? "listening" : ""}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>

          {voiceError && (
            <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>{voiceError}</p>
          )}

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="submit-button"
          >
            {loading ? "Processing..." : (
              <>
                <Plus size={20} /> Create Smart Task
              </>
            )}
          </button>
        </form>
      </section>

      {/* Phase 2 Kanban board placeholder: uses workspaceId if provided later by workspace switcher */}
      {workspaceId ? (
        <KanbanBoard workspaceId={workspaceId} />
      ) : (
        <section className="task-list">
          <h2>Your Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <button onClick={() => handleToggleStatus(task)}>
                    {/* keep existing UI semantics; icon removed for simplicity */}
                    ✓
                  </button>
                  <h3>{task.title}</h3>
                  <button onClick={() => handleDeleteTask(task._id)}>×</button>
                </div>
                <p>{task.description}</p>
                <small>{new Date(task.createdAt).toLocaleDateString()}</small>
                {task.aiInsights && (
                  <div>
                    <b>AI Insight:</b> {task.aiInsights}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
};

