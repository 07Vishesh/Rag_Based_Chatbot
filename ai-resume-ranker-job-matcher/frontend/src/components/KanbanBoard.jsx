import { AnimatePresence, motion } from "framer-motion";
import { FilterX, FolderKanban, Plus } from "lucide-react";
import TaskCard from "./TaskCard.jsx";

const buttonMotion = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.97 }
};

export default function KanbanBoard({
  columns,
  dragOverStatus,
  draggedTaskId,
  filtersActive,
  filteredTotal,
  onClearFilters,
  onCreateTask,
  onDeleteTask,
  onDragEnd,
  onDragHover,
  onDragStart,
  onDropTask,
  onEditTask,
  onToggleCompletion,
  tasksByStatus,
  totalTasks
}) {
  const boardIsEmpty = filteredTotal === 0;

  return (
    <section className="board-shell">
      <div className="board-header">
        <div>
          <p className="eyebrow">Kanban workspace</p>
          <h2>Move work with confidence</h2>
          <p className="support-copy">
            Drag tasks across stages, keep details close, and maintain a clean delivery rhythm.
          </p>
        </div>

        <div className="board-actions">
          <div className="count-pill">
            <FolderKanban size={16} />
            {filteredTotal} in view
          </div>

          <motion.button
            type="button"
            className="btn btn-primary"
            onClick={() => onCreateTask("todo")}
            {...buttonMotion}
          >
            <Plus size={17} />
            Add Task
          </motion.button>
        </div>
      </div>

      {boardIsEmpty ? (
        <motion.div
          className="board-empty-state"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="empty-illustration">
            <div className="empty-illustration-ring" />
            <div className="empty-illustration-card card-one" />
            <div className="empty-illustration-card card-two" />
            <div className="empty-illustration-card card-three" />
          </div>

          <h3>{totalTasks === 0 ? "Build your first board" : "No tasks match the current filters"}</h3>
          <p>
            {totalTasks === 0
              ? "Start with a few priorities and the workspace will track progress, deadlines, and delivery health."
              : "Adjust the filters or clear them to bring more tasks back into view."}
          </p>

          <div className="empty-actions">
            {filtersActive ? (
              <motion.button
                type="button"
                className="btn btn-secondary"
                onClick={onClearFilters}
                {...buttonMotion}
              >
                <FilterX size={16} />
                Clear Filters
              </motion.button>
            ) : null}

            <motion.button
              type="button"
              className="btn btn-primary"
              onClick={() => onCreateTask("todo")}
              {...buttonMotion}
            >
              <Plus size={16} />
              Create a Task
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="board-columns">
          {columns.map((column, index) => (
            <motion.section
              key={column.value}
              layout
              className={`board-column ${column.accentClass} ${
                dragOverStatus === column.value ? "is-drop-target" : ""
              }`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: index * 0.06 }}
              onDragEnter={() => onDragHover(column.value)}
              onDragOver={(event) => {
                event.preventDefault();
                onDragHover(column.value);
              }}
              onDrop={(event) => {
                event.preventDefault();
                onDropTask(column.value);
              }}
            >
              <div className="board-column-head">
                <div>
                  <div className="board-column-title">
                    <h3>{column.label}</h3>
                    <span>{tasksByStatus[column.value]?.length || 0}</span>
                  </div>
                  <p>{column.description}</p>
                </div>

                <motion.button
                  type="button"
                  className="icon-button"
                  onClick={() => onCreateTask(column.value)}
                  aria-label={`Add task to ${column.label}`}
                  {...buttonMotion}
                >
                  <Plus size={16} />
                </motion.button>
              </div>

              <div className="task-stack">
                <AnimatePresence initial={false}>
                  {tasksByStatus[column.value]?.map((task) => (
                    <TaskCard
                      key={task.id}
                      isDragging={draggedTaskId === task.id}
                      onDelete={onDeleteTask}
                      onDragEnd={onDragEnd}
                      onDragStart={onDragStart}
                      onEdit={onEditTask}
                      onToggleComplete={onToggleCompletion}
                      task={task}
                    />
                  ))}
                </AnimatePresence>

                {!tasksByStatus[column.value]?.length ? (
                  <div className="column-empty">
                    <span>Drop tasks here</span>
                    <p>This lane is clear and ready for the next item.</p>
                  </div>
                ) : null}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </section>
  );
}
