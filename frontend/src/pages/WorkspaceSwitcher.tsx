import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { getWorkspaces, createWorkspace, type Workspace } from "../services/api";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "./WorkspaceSwitcher.css";

export const WorkspaceSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await getWorkspaces();
      setWorkspaces(response.data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces");
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    try {
      await createWorkspace({ name: newName, description: newDescription });
      toast.success("Workspace created!");
      setNewName("");
      setNewDescription("");
      setShowCreateForm(false);
      await fetchWorkspaces();
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkspace = (workspace: Workspace) => {
    localStorage.setItem("selectedWorkspace", JSON.stringify(workspace));
    navigate(`/dashboard?workspace=${workspace._id}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="workspace-switcher-container">
      <header className="workspace-header">
        <div className="workspace-header-content">
          <h1>Workspaces</h1>
          <div className="workspace-header-actions">
            <button
              onClick={() => navigate("/settings")}
              className="icon-button"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button onClick={handleLogout} className="logout-button">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="workspace-main">
        {workspaces.length === 0 ? (
          <div className="workspace-empty">
            <p>No workspaces yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="workspace-grid">
            {workspaces.map((workspace) => (
              <div
                key={workspace._id}
                onClick={() => handleSelectWorkspace(workspace)}
                className="workspace-card"
              >
                <h2>{workspace.name}</h2>
                {workspace.description && <p>{workspace.description}</p>}
                <small>Click to open</small>
              </div>
            ))}
          </div>
        )}

        <div className="workspace-create-section">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="create-workspace-button"
            >
              <Plus size={20} /> Create New Workspace
            </button>
          ) : (
            <form onSubmit={handleCreateWorkspace} className="create-workspace-form">
              <input
                type="text"
                placeholder="Workspace name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <div className="form-buttons">
                <button type="submit" disabled={loading || !newName.trim()}>
                  {loading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
