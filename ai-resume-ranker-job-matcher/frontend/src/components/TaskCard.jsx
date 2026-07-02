import { motion } from "framer-motion";
import {
  CalendarDays,
  CircleCheckBig,
  GripVertical,
  PencilLine,
  RotateCcw,
  Trash2
} from "lucide-react";

const buttonMotion = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.96 }
};

const statusLabels = {
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done"
};

function formatDueDate(value) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function getDueState(task) {
  if (!task.dueDate) {
    return { label: "No deadline", tone: "neutral" };
  }

  if (task.status === "done") {
    return { label: `Completed • ${formatDueDate(task.dueDate)}`, tone: "accent" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  const diffInDays = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);

  if (diffInDays < 0) {
    return { label: `Overdue • ${formatDueDate(task.dueDate)}`, tone: "danger" };
  }

  if (diffInDays <= 3) {
    return { label: `Due soon • ${formatDueDate(task.dueDate)}`, tone: "warning" };
  }

  return { label: `Due ${formatDueDate(task.dueDate)}`, tone: "neutral" };
}

export default function TaskCard({
  isDragging,
  onDelete,
  onDragEnd,
  onDragStart,
  onEdit,
  onToggleComplete,
  task
}) {
  const dueState = getDueState(task);

  return (
    <motion.article
      layout
      draggable
      className={`task-card ${task.status === "done" ? "is-done" : ""} ${isDragging ? "is-dragging" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{
        opacity: task.status === "done" ? 0.8 : 1,
        y: 0,
        scale: isDragging ? 1.03 : 1
      }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -5, boxShadow: "0 26px 48px rgba(15, 23, 42, 0.14)" }}
      transition={{ duration: 0.28 }}
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-top">
        <div className="task-grab-handle">
          <GripVertical size={15} />
        </div>

        <div className="task-pill-row">
          <span className={`task-pill priority-${task.priority}`}>{task.priority}</span>
          <span className="task-pill task-pill-muted">{task.category}</span>
        </div>
      </div>

      <div className="task-body">
        <h3 className="task-title">{task.title}</h3>
        {task.description ? <p className="task-description">{task.description}</p> : null}
      </div>

      <div className="task-meta">
        <div className={`due-chip tone-${dueState.tone}`}>
          <CalendarDays size={14} />
          <span>{dueState.label}</span>
        </div>
        <span className={`status-chip status-${task.status}`}>{statusLabels[task.status]}</span>
      </div>

      <div className="task-actions">
        <motion.button
          type="button"
          className="icon-button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={task.status === "done" ? "Reopen task" : "Mark task complete"}
          title={task.status === "done" ? "Reopen task" : "Mark task complete"}
          {...buttonMotion}
        >
          {task.status === "done" ? <RotateCcw size={16} /> : <CircleCheckBig size={16} />}
        </motion.button>

        <motion.button
          type="button"
          className="icon-button"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          title="Edit task"
          {...buttonMotion}
        >
          <PencilLine size={16} />
        </motion.button>

        <motion.button
          type="button"
          className="icon-button danger"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          title="Delete task"
          {...buttonMotion}
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.article>
  );
}
