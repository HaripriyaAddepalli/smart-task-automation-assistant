import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getKanbanBoard, moveKanbanTask, updateTask, deleteTask } from "../services/api";
import type { KanbanAssignment, Task, KanbanBoard as KanbanBoardType } from "../services/api";
import { useSocket } from "../hooks/useSocket";
import toast from "react-hot-toast";
import { CheckCircle, Trash2 } from "lucide-react";
import "./KanbanBoard.css";

type ColumnId = "todo" | "in-progress" | "done";



type SortableTaskProps = {
  assignment: KanbanAssignment;
  onToggleStatus: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

function SortableTask({ assignment, onToggleStatus, onDelete }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: assignment._id,
    data: { assignment },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const task = assignment.taskId as Task;
  const columnClass = assignment.column === "done" ? "completed" : "";

  return (
    <div ref={setNodeRef} style={style} className={`kanban-task ${columnClass} ${task?.priority || ""}`}>
      <div className="kanban-task-content" {...attributes} {...listeners}>
        <div className="kanban-task-header">
          <button
            type="button"
            className="icon-button"
            onClick={() => onToggleStatus(task)}
            aria-label="Toggle status"
          >
            <CheckCircle size={16} />
          </button>
          <div className="kanban-task-title">{task?.title ?? "Untitled"}</div>
          <button type="button" className="icon-button danger" onClick={() => onDelete(task?._id ?? String(assignment.taskId))}>
            <Trash2 size={16} />
          </button>
        </div>
        {task?.description && <div className="kanban-task-desc">{task.description}</div>}
        {task?.aiInsights && <div className="kanban-task-ai">AI: {task.aiInsights}</div>}
      </div>
      <div className="kanban-task-hint">Drag to move</div>
      {isDragging && <div className="kanban-drag-overlay" />}
    </div>
  );
}

export const KanbanBoard = ({ workspaceId }: { workspaceId: string }) => {
  const [board, setBoard] = useState<KanbanBoardType | null>(null);
  const [loading, setLoading] = useState(false);

  const { on } = useSocket(workspaceId);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getKanbanBoard(workspaceId);
      setBoard(res.data);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    const initialize = async () => {
      await refresh();
    };
    void initialize();
  }, [refresh]);

  // Real-time updates
  useEffect(() => {
    const offCreated = on("task:created", () => refresh());
    const offUpdated = on("task:updated", () => refresh());
    const offDeleted = on("task:deleted", () => refresh());
    return () => {
      offCreated();
      offUpdated();
      offDeleted();
    };
  }, [on, refresh]);

  const columns = useMemo(() => {
    if (!board) {
      return { todo: [] as KanbanAssignment[], "in-progress": [] as KanbanAssignment[], done: [] as KanbanAssignment[] };
    }
    return board;
  }, [board]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    // over.id will be container column id
    const activeData = active.data.current as { assignment?: KanbanAssignment };
    const assignment = activeData?.assignment;
    const targetColumn = String(over.id) as ColumnId;

    if (!assignment) return;

    // Determine target order as last in that column
    const targetList = columns[targetColumn] || [];
    const nextOrder = targetList.length;

    // assignment._id is needed for backend
    await moveKanbanTask(workspaceId, assignment._id, {
      column: targetColumn,
      order: nextOrder,
    });

    toast.success("Task moved ✅");
    refresh();
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await updateTask(task._id, { status: newStatus });
    refresh();
  };

  const removeTask = async (taskId: string) => {
    await deleteTask(taskId);
    refresh();
  };

  if (loading && !board) {
    return <div className="kanban-page">Loading Kanban...</div>;
  }

  return (
    <div className="kanban-page">
      <div className="kanban-toolbar">
        <button type="button" className="btn" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="kanban-grid">
          {([
            { id: "todo", title: "To do" },
            { id: "in-progress", title: "In progress" },
            { id: "done", title: "Done" },
          ] as Array<{ id: ColumnId; title: string }>).map(({ id, title }) => {
            const list = columns[id] ?? [];
            return (
              <div key={id} className="kanban-column" data-column={id}>
                <div className="kanban-column-header">{title} ({list.length})</div>

                <SortableContext items={list.map((a) => a._id)} strategy={horizontalListSortingStrategy}>
                  <div className="kanban-column-drop" id={id}>
                    {list.map((assignment) => (
                      <SortableTask
                        key={assignment._id}
                        assignment={assignment}
                        onToggleStatus={toggleStatus}
                        onDelete={removeTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};

