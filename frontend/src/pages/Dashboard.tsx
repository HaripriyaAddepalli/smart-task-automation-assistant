import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Plus, Trash2, CheckCircle } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import type { Task } from '../services/api';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import './Dashboard.css';
import { ChatBot } from "../components/ChatBot";
import toast from "react-hot-toast";

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const { isListening, transcript, startListening, stopListening, error: voiceError } =
    useVoiceRecognition();

  useEffect(() => {
  if (tasks.length > 0) {
    toast("You have tasks in your dashboard 🔔");
  }
}, [tasks.length]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);

  // 🔊 SOUND FUNCTION
  const playSound = () => {
    const audio = new Audio("/notify.mp3");
    audio.play();
  };

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // ✅ CREATE TASK (FIXED)
  const handleCreateTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      await createTask({
        title: prompt,
        description: prompt,
        priority: "medium",
      });
      toast.success("Task created successfully 🚀");
      playSound();

      setPrompt('');
      fetchTasks();
    } catch (error) {
      toast.error("Failed to create task ❌");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(task._id, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="dashboard-container">

      <header className="header">
        <h1>AI Task Assistant</h1>
        <p>Automate your workflow with voice and AI</p>
      </header>

      {/* CHATBOT */}
      <ChatBot />

      {/* INPUT */}
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
              className={`mic-button ${isListening ? 'listening' : ''}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>

          {voiceError && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              {voiceError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="submit-button"
          >
            {loading ? 'Processing...' : (
              <>
                <Plus size={20} /> Create Smart Task
              </>
            )}
          </button>
        </form>
      </section>

      {/* TASK LIST */}
      <section className="task-list">
        <h2>Your Tasks ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="task-card">

              <div className="task-header">
                <button onClick={() => handleToggleStatus(task)}>
                  <CheckCircle />
                </button>

                <h3>{task.title}</h3>

                <button onClick={() => handleDeleteTask(task._id)}>
                  <Trash2 />
                </button>
              </div>

              <p>{task.description}</p>

              <small>
                {new Date(task.createdAt).toLocaleDateString()}
              </small>

              {task.aiInsights && (
                <div>
                  <b>AI Insight:</b> {task.aiInsights}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
};