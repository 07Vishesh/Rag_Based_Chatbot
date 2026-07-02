import { startTransition, useDeferredValue, useEffect, useMemo, useReducer, useState } from "react";
import { motion } from "framer-motion";
import Dashboard from "./components/Dashboard.jsx";
import KanbanBoard from "./components/KanbanBoard.jsx";
import Modal from "./components/Modal.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";

const STORAGE_KEY = "smart-task-manager-pro.tasks";

const DEFAULT_FILTERS = {
  query: "",
  priority: "all",
  status: "all",
  category: "all",
  view: "all"
};

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "inprogress", label: "In Progress" },
  { value: "done", label: "Done" }
];

const CATEGORY_OPTIONS = ["Product", "Design", "Engineering", "Operations", "Personal"];

const BOARD_COLUMNS = [
  {
    value: "todo",
    label: "To Do",
    description: "Ideas and commitments ready to move.",
    accentClass: "is-primary",
    chartColor: "#2563eb"
  },
  {
    value: "inprogress",
    label: "In Progress",
    description: "Active work currently in motion.",
    accentClass: "is-warning",
    chartColor: "#f59e0b"
  },
  {
    value: "done",
    label: "Done",
    description: "Completed work and closed loops.",
    accentClass: "is-accent",
    chartColor: "#10b981"
  }
];

const DEMO_TASKS = [
  {
    id: "task-1",
    title: "Polish the investor update deck",
    description: "Refine headline metrics, simplify the roadmap slide, and tighten the CTA for the board review.",
    priority: "high",
    dueDate: "2026-04-18",
    status: "todo",
    category: "Operations",
    previousStatus: "todo"
  },
  {
    id: "task-2",
    title: "Ship onboarding checklist v2",
    description: "Final QA for the empty states, tooltip copy, and first-session activation nudges.",
    priority: "high",
    dueDate: "2026-04-17",
    status: "inprogress",
    category: "Product",
    previousStatus: "inprogress"
  },
  {
    id: "task-3",
    title: "Sync motion specs with design",
    description: "Validate hover states, easing curves, and mobile spacing for the new dashboard experience.",
    priority: "medium",
    dueDate: "2026-04-20",
    status: "inprogress",
    category: "Design",
    previousStatus: "inprogress"
  },
  {
    id: "task-4",
    title: "Plan sprint demo talking points",
    description: "Capture release highlights, blockers removed, and measurable wins for the weekly walkthrough.",
    priority: "medium",
    dueDate: "2026-04-22",
    status: "todo",
    category: "Engineering",
    previousStatus: "todo"
  },
  {
    id: "task-5",
    title: "Personal finance review",
    description: "Reconcile subscriptions, transfer savings, and log monthly recurring expenses.",
    priority: "low",
    dueDate: "2026-04-25",
    status: "done",
    category: "Personal",
    previousStatus: "todo"
  }
];

function createTaskId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeDate(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeTask(task, index = 0) {
  const priority = ["high", "medium", "low"].includes(task?.priority) ? task.priority : "medium";
  const status = STATUS_OPTIONS.some((option) => option.value === task?.status) ? task.status : "todo";
  const category = CATEGORY_OPTIONS.includes(task?.category)
    ? task.category
    : CATEGORY_OPTIONS[index % CATEGORY_OPTIONS.length];

  return {
    id: typeof task?.id === "string" ? task.id : createTaskId(),
    title:
      typeof task?.title === "string" && task.title.trim()
        ? task.title.trim()
        : "Untitled task",
    description: typeof task?.description === "string" ? task.description.trim() : "",
    priority,
    dueDate: normalizeDate(task?.dueDate),
    status,
    category,
    previousStatus:
      status === "done"
        ? typeof task?.previousStatus === "string" && task.previousStatus !== "done"
          ? task.previousStatus
          : "todo"
        : status
  };
}

function sortTasks(tasks) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return [...tasks].sort((left, right) => {
    if (left.status === "done" && right.status !== "done") {
      return 1;
    }

    if (left.status !== "done" && right.status === "done") {
      return -1;
    }

    const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

    if (leftDue !== rightDue) {
      return leftDue - rightDue;
    }

    if (priorityOrder[left.priority] !== priorityOrder[right.priority]) {
      return priorityOrder[left.priority] - priorityOrder[right.priority];
    }

    return left.title.localeCompare(right.title);
  });
}

function seedTasks() {
  return sortTasks(DEMO_TASKS.map((task, index) => normalizeTask(task, index)));
}

function loadStoredTasks() {
  if (typeof window === "undefined") {
    return seedTasks();
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return seedTasks();
    }

    const parsed = JSON.parse(storedValue);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return seedTasks();
    }

    return sortTasks(parsed.map((task, index) => normalizeTask(task, index)));
  } catch {
    return seedTasks();
  }
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "done") {
    return false;
  }

  return new Date(task.dueDate) < startOfToday();
}

function isDueSoon(task) {
  if (!task.dueDate || task.status === "done") {
    return false;
  }

  const target = new Date(task.dueDate);
  const diffInDays = Math.ceil((target.getTime() - startOfToday().getTime()) / 86400000);
  return diffInDays >= 0 && diffInDays <= 3;
}

function buildTaskPayload(formData, existingTask) {
  const nextStatus = STATUS_OPTIONS.some((option) => option.value === formData.status)
    ? formData.status
    : "todo";

  return normalizeTask({
    id: existingTask?.id ?? createTaskId(),
    title: formData.title,
    description: formData.description,
    priority: formData.priority,
    dueDate: formData.dueDate,
    status: nextStatus,
    category: formData.category,
    previousStatus:
      nextStatus === "done"
        ? existingTask?.status === "done"
          ? existingTask.previousStatus || "todo"
          : existingTask?.status || "todo"
        : nextStatus
  });
}

function tasksReducer(state, action) {
  // Keep every write path normalized and re-sorted so the board stays predictable.
  switch (action.type) {
    case "add":
      return sortTasks([action.payload, ...state]);

    case "update":
      return sortTasks(state.map((task) => (task.id === action.payload.id ? action.payload : task)));

    case "delete":
      return state.filter((task) => task.id !== action.payload);

    case "toggleCompletion":
      return sortTasks(
        state.map((task) => {
          if (task.id !== action.payload) {
            return task;
          }

          if (task.status === "done") {
            const reopenedStatus =
              typeof task.previousStatus === "string" && task.previousStatus !== "done"
                ? task.previousStatus
                : "todo";

            return {
              ...task,
              status: reopenedStatus,
              previousStatus: reopenedStatus
            };
          }

          return {
            ...task,
            status: "done",
            previousStatus: task.status
          };
        })
      );

    case "move":
      return sortTasks(
        state.map((task) => {
          if (task.id !== action.payload.id) {
            return task;
          }

          if (task.status === action.payload.status) {
            return task;
          }

          return {
            ...task,
            status: action.payload.status,
            previousStatus:
              action.payload.status === "done"
                ? task.status === "done"
                  ? task.previousStatus || "todo"
                  : task.status
                : action.payload.status
          };
        })
      );

    default:
      return state;
  }
}

export default function App() {
  const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadStoredTasks);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "create",
    task: null
  });
  const [draggedTaskId, setDraggedTaskId] = useState("");
  const [dragOverStatus, setDragOverStatus] = useState("");

  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "done").length;
    const pending = total - completed;
    const overdue = tasks.filter(isOverdue).length;
    const dueSoon = tasks.filter(isDueSoon).length;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      dueSoon,
      progress,
      statusChartData: BOARD_COLUMNS.map((column) => ({
        name: column.label,
        value: tasks.filter((task) => task.status === column.value).length,
        color: column.chartColor
      })),
      priorityBreakdown: [
        { name: "High", value: tasks.filter((task) => task.priority === "high").length, color: "#ef4444" },
        { name: "Medium", value: tasks.filter((task) => task.priority === "medium").length, color: "#f59e0b" },
        { name: "Low", value: tasks.filter((task) => task.priority === "low").length, color: "#2563eb" }
      ]
    };
  }, [tasks]);

  const searchTerm = deferredQuery.trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }

      if (filters.status !== "all" && task.status !== filters.status) {
        return false;
      }

      if (filters.category !== "all" && task.category !== filters.category) {
        return false;
      }

      if (filters.view === "focus" && !(task.priority === "high" && task.status !== "done")) {
        return false;
      }

      if (filters.view === "dueSoon" && !(isDueSoon(task) || isOverdue(task))) {
        return false;
      }

      if (filters.view === "completed" && task.status !== "done") {
        return false;
      }

      if (searchTerm) {
        const searchableText = `${task.title} ${task.description} ${task.category}`.toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [filters.category, filters.priority, filters.status, filters.view, searchTerm, tasks]);

  const tasksByStatus = useMemo(() => {
    return BOARD_COLUMNS.reduce(
      (collection, column) => ({
        ...collection,
        [column.value]: filteredTasks.filter((task) => task.status === column.value)
      }),
      {}
    );
  }, [filteredTasks]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set([...CATEGORY_OPTIONS, ...tasks.map((task) => task.category)]));

    return [
      { value: "all", label: "All Categories", count: tasks.length },
      ...uniqueCategories.map((category) => ({
        value: category,
        label: category,
        count: tasks.filter((task) => task.category === category).length
      }))
    ];
  }, [tasks]);

  const priorityFilters = useMemo(() => {
    return PRIORITY_OPTIONS.map((option) => ({
      ...option,
      count: option.value === "all" ? tasks.length : tasks.filter((task) => task.priority === option.value).length
    }));
  }, [tasks]);

  const statusFilters = useMemo(() => {
    return [
      { value: "all", label: "All Statuses", count: tasks.length },
      ...STATUS_OPTIONS.map((option) => ({
        ...option,
        count: tasks.filter((task) => task.status === option.value).length
      }))
    ];
  }, [tasks]);

  const viewOptions = useMemo(() => {
    return [
      {
        value: "all",
        label: "All Work",
        description: "Everything across your workspace",
        count: tasks.length
      },
      {
        value: "focus",
        label: "Needs Focus",
        description: "High-priority tasks still open",
        count: tasks.filter((task) => task.priority === "high" && task.status !== "done").length
      },
      {
        value: "dueSoon",
        label: "Due Soon",
        description: "Next 3 days plus overdue items",
        count: tasks.filter((task) => isDueSoon(task) || isOverdue(task)).length
      },
      {
        value: "completed",
        label: "Completed",
        description: "Finished work ready to review",
        count: tasks.filter((task) => task.status === "done").length
      }
    ];
  }, [tasks]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.priority !== DEFAULT_FILTERS.priority ||
      filters.status !== DEFAULT_FILTERS.status ||
      filters.category !== DEFAULT_FILTERS.category ||
      filters.view !== DEFAULT_FILTERS.view ||
      Boolean(filters.query.trim())
    );
  }, [filters]);

  function handleFilterChange(key, value) {
    if (key === "query") {
      startTransition(() => {
        setFilters((currentFilters) => ({
          ...currentFilters,
          query: value
        }));
      });

      return;
    }

    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
  }

  function openCreateModal(status = "todo") {
    setModalState({
      isOpen: true,
      mode: "create",
      task: {
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        status,
        category: "Product"
      }
    });
  }

  function openEditModal(task) {
    setModalState({
      isOpen: true,
      mode: "edit",
      task
    });
  }

  function closeModal() {
    setModalState({
      isOpen: false,
      mode: "create",
      task: null
    });
  }

  function handleSaveTask(formData) {
    const existingTask =
      modalState.mode === "edit"
        ? tasks.find((task) => task.id === modalState.task?.id) || null
        : null;

    const payload = buildTaskPayload(formData, existingTask);

    dispatch({
      type: modalState.mode === "edit" ? "update" : "add",
      payload
    });

    closeModal();
  }

  function handleDeleteTask(taskId) {
    dispatch({ type: "delete", payload: taskId });
  }

  function handleToggleCompletion(taskId) {
    dispatch({ type: "toggleCompletion", payload: taskId });
  }

  function handleDragStart(taskId) {
    setDraggedTaskId(taskId);
  }

  function handleDragEnd() {
    setDraggedTaskId("");
    setDragOverStatus("");
  }

  function handleDragHover(status) {
    if (draggedTaskId) {
      setDragOverStatus(status);
    }
  }

  function handleDrop(status) {
    if (!draggedTaskId) {
      return;
    }

    dispatch({
      type: "move",
      payload: {
        id: draggedTaskId,
        status
      }
    });

    setDraggedTaskId("");
    setDragOverStatus("");
  }

  return (
    <motion.div
      className="app-shell"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="page-orb orb-left" />
      <div className="page-orb orb-right" />

      <Navbar metrics={metrics} onAddTask={() => openCreateModal("todo")} />

      <div className="workspace-layout">
        <Sidebar
          filters={filters}
          filteredCount={filteredTasks.length}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={() => setFilters(DEFAULT_FILTERS)}
          priorityOptions={priorityFilters}
          statusOptions={statusFilters}
          categoryOptions={categories}
          searchPending={searchTerm !== filters.query.trim().toLowerCase()}
          totalTasks={tasks.length}
          viewOptions={viewOptions}
        />

        <main className="main-panel">
          <Dashboard metrics={metrics} />

          <KanbanBoard
            columns={BOARD_COLUMNS}
            dragOverStatus={dragOverStatus}
            draggedTaskId={draggedTaskId}
            filtersActive={hasActiveFilters}
            filteredTotal={filteredTasks.length}
            onClearFilters={() => setFilters(DEFAULT_FILTERS)}
            onCreateTask={openCreateModal}
            onDeleteTask={handleDeleteTask}
            onDragEnd={handleDragEnd}
            onDragHover={handleDragHover}
            onDragStart={handleDragStart}
            onDropTask={handleDrop}
            onEditTask={openEditModal}
            onToggleCompletion={handleToggleCompletion}
            tasksByStatus={tasksByStatus}
            totalTasks={tasks.length}
          />
        </main>
      </div>

      <Modal
        categoryOptions={CATEGORY_OPTIONS}
        mode={modalState.mode}
        onClose={closeModal}
        onSave={handleSaveTask}
        open={modalState.isOpen}
        priorityOptions={PRIORITY_OPTIONS.filter((option) => option.value !== "all")}
        statusOptions={STATUS_OPTIONS}
        task={modalState.task}
      />
    </motion.div>
  );
}
