import { motion } from "framer-motion";
import { CalendarDays, CloudCheck, LayoutDashboard, Plus, Sparkles } from "lucide-react";

const buttonMotion = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.97 }
};

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date());
}

export default function Navbar({ metrics, onAddTask }) {
  return (
    <motion.header
      className="navbar-card"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
    >
      <div className="brand-block">
        <div className="brand-mark">
          <LayoutDashboard size={22} />
        </div>

        <div>
          <p className="eyebrow">Operational clarity for modern teams</p>
          <h1>Smart Task Manager Pro</h1>
          <p className="support-copy">
            A polished command center for priorities, deadlines, and momentum.
          </p>
        </div>
      </div>

      <div className="navbar-actions">
        <div className="meta-pill">
          <CalendarDays size={16} />
          <div>
            <span>Today</span>
            <strong>{formatToday()}</strong>
          </div>
        </div>

        <div className="meta-pill accent">
          <Sparkles size={16} />
          <div>
            <span>Completion rate</span>
            <strong>{metrics.progress}%</strong>
          </div>
        </div>

        <div className="meta-pill">
          <CloudCheck size={16} />
          <div>
            <span>Storage</span>
            <strong>Auto-saved locally</strong>
          </div>
        </div>

        <motion.button
          type="button"
          className="btn btn-primary"
          onClick={onAddTask}
          {...buttonMotion}
        >
          <Plus size={18} />
          New Task
        </motion.button>
      </div>
    </motion.header>
  );
}
