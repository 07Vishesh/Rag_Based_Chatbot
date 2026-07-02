import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Flag, Layers3, Save, Sparkles, TextCursorInput, X } from "lucide-react";

const buttonMotion = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.97 }
};

function getInitialState(task) {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    dueDate: task?.dueDate ?? "",
    status: task?.status ?? "todo",
    category: task?.category ?? "Product"
  };
}

export default function Modal({
  categoryOptions,
  mode,
  onClose,
  onSave,
  open,
  priorityOptions,
  statusOptions,
  task
}) {
  const [formState, setFormState] = useState(getInitialState(task));

  useEffect(() => {
    if (open) {
      setFormState(getInitialState(task));
    }
  }, [open, task]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  const trimmedTitle = formState.title.trim();
  const canSubmit = Boolean(trimmedTitle);

  function handleChange(key, value) {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSave({
      ...formState,
      title: trimmedTitle,
      description: formState.description.trim()
    });
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-panel"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Task editor</p>
                <h2>{mode === "edit" ? "Update task details" : "Create a new task"}</h2>
                <p className="support-copy">
                  Add clear context, set the right priority, and keep your board perfectly organized.
                </p>
              </div>

              <motion.button
                type="button"
                className="icon-button"
                onClick={onClose}
                aria-label="Close modal"
                {...buttonMotion}
              >
                <X size={16} />
              </motion.button>
            </div>

            <form className="task-form" onSubmit={handleSubmit}>
              <label className="form-field full-width">
                <span>
                  <TextCursorInput size={15} />
                  Task title
                </span>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                  placeholder="What needs to happen?"
                  autoFocus
                />
              </label>

              <label className="form-field full-width">
                <span>
                  <Sparkles size={15} />
                  Description
                </span>
                <textarea
                  rows="4"
                  value={formState.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  placeholder="Add useful context, next steps, or notes for the team."
                />
              </label>

              <div className="form-grid">
                <label className="form-field">
                  <span>
                    <Layers3 size={15} />
                    Category
                  </span>
                  <select
                    value={formState.category}
                    onChange={(event) => handleChange("category", event.target.value)}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>
                    <Flag size={15} />
                    Priority
                  </span>
                  <select
                    value={formState.priority}
                    onChange={(event) => handleChange("priority", event.target.value)}
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>
                    <Sparkles size={15} />
                    Status
                  </span>
                  <select
                    value={formState.status}
                    onChange={(event) => handleChange("status", event.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>
                    <CalendarDays size={15} />
                    Due date
                  </span>
                  <input
                    type="date"
                    value={formState.dueDate}
                    onChange={(event) => handleChange("dueDate", event.target.value)}
                  />
                </label>
              </div>

              <div className="form-footer">
                <p className={`helper-copy ${canSubmit ? "" : "text-danger"}`}>
                  Empty submissions are blocked so every card starts with a meaningful title.
                </p>

                <div className="modal-actions">
                  <motion.button type="button" className="btn btn-secondary" onClick={onClose} {...buttonMotion}>
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!canSubmit}
                    {...buttonMotion}
                  >
                    <Save size={16} />
                    {mode === "edit" ? "Save Changes" : "Create Task"}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
