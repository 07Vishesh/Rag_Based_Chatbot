import { motion } from "framer-motion";
import {
  CalendarClock,
  CircleAlert,
  CircleCheckBig,
  Filter,
  Layers3,
  Search,
  Sparkles,
  X
} from "lucide-react";

const buttonMotion = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.98 }
};

const viewIconMap = {
  all: Layers3,
  focus: CircleAlert,
  dueSoon: CalendarClock,
  completed: CircleCheckBig
};

function FilterTile({ active, count, description, icon: Icon, label, onClick }) {
  return (
    <motion.button
      type="button"
      className={`filter-tile ${active ? "is-active" : ""}`}
      onClick={onClick}
      {...buttonMotion}
    >
      <div className="filter-tile-copy">
        <div className="filter-tile-title">
          <Icon size={16} />
          <strong>{label}</strong>
        </div>
        <span>{description}</span>
      </div>
      <em>{count}</em>
    </motion.button>
  );
}

function OptionChip({ active, count, label, onClick }) {
  return (
    <motion.button
      type="button"
      className={`option-chip ${active ? "is-active" : ""}`}
      onClick={onClick}
      {...buttonMotion}
    >
      <span>{label}</span>
      <em>{count}</em>
    </motion.button>
  );
}

export default function Sidebar({
  filters,
  filteredCount,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
  priorityOptions,
  statusOptions,
  categoryOptions,
  searchPending,
  totalTasks,
  viewOptions
}) {
  return (
    <aside className="sidebar-card">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Workspace controls</p>
          <h2>Filter &amp; focus</h2>
        </div>
        <div className="count-pill">
          <Filter size={16} />
          {filteredCount}/{totalTasks} visible
        </div>
      </div>

      <section className="sidebar-section">
        <label className="section-label" htmlFor="task-search">
          <Search size={15} />
          Search tasks
        </label>
        <div className={`search-shell ${searchPending ? "is-pending" : ""}`}>
          <Search size={16} />
          <input
            id="task-search"
            type="text"
            value={filters.query}
            onChange={(event) => onFilterChange("query", event.target.value)}
            placeholder="Search titles, notes, or categories"
          />
        </div>
        <p className="helper-copy">
          {searchPending ? "Updating your search..." : "Quickly narrow the board without losing context."}
        </p>
      </section>

      <section className="sidebar-section">
        <div className="section-label">
          <Sparkles size={15} />
          Smart views
        </div>

        <div className="tile-stack">
          {viewOptions.map((option) => (
            <FilterTile
              key={option.value}
              active={filters.view === option.value}
              count={option.count}
              description={option.description}
              icon={viewIconMap[option.value] || Layers3}
              label={option.label}
              onClick={() => onFilterChange("view", option.value)}
            />
          ))}
        </div>
      </section>

      <section className="sidebar-section">
        <div className="section-label">Priority</div>
        <div className="chip-grid">
          {priorityOptions.map((option) => (
            <OptionChip
              key={option.value}
              active={filters.priority === option.value}
              count={option.count}
              label={option.label}
              onClick={() => onFilterChange("priority", option.value)}
            />
          ))}
        </div>
      </section>

      <section className="sidebar-section">
        <div className="section-label">Status</div>
        <div className="chip-grid">
          {statusOptions.map((option) => (
            <OptionChip
              key={option.value}
              active={filters.status === option.value}
              count={option.count}
              label={option.label}
              onClick={() => onFilterChange("status", option.value)}
            />
          ))}
        </div>
      </section>

      <section className="sidebar-section">
        <div className="section-label">Categories</div>
        <div className="chip-grid">
          {categoryOptions.map((option) => (
            <OptionChip
              key={option.value}
              active={filters.category === option.value}
              count={option.count}
              label={option.label}
              onClick={() => onFilterChange("category", option.value)}
            />
          ))}
        </div>
      </section>

      <div className="sidebar-footer">
        <p className="helper-copy">
          Use filters to create a focused board for standups, planning, or personal review.
        </p>

        <motion.button
          type="button"
          className="btn btn-secondary full-width"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
          {...buttonMotion}
        >
          <X size={16} />
          Reset filters
        </motion.button>
      </div>
    </aside>
  );
}
