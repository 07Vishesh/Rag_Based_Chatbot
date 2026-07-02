import { motion } from "framer-motion";
import { AlertTriangle, CheckCheck, Clock3, Layers3, Target } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const cardMotion = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.45 }
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="chart-tooltip">
      <strong>{item.name}</strong>
      <span>{item.value} tasks</span>
    </div>
  );
}

export default function Dashboard({ metrics }) {
  const statCards = [
    {
      label: "Total Tasks",
      value: metrics.total,
      description: "Across all categories",
      tone: "primary",
      icon: Layers3
    },
    {
      label: "Completed",
      value: metrics.completed,
      description: "Successfully closed",
      tone: "accent",
      icon: CheckCheck
    },
    {
      label: "Pending",
      value: metrics.pending,
      description: "Still in motion",
      tone: "warning",
      icon: Clock3
    },
    {
      label: "Overdue",
      value: metrics.overdue,
      description: "Needs attention soon",
      tone: "danger",
      icon: AlertTriangle
    }
  ];

  return (
    <section className="dashboard-grid">
      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.article
              key={card.label}
              className={`stat-card tone-${card.tone}`}
              {...cardMotion}
              transition={{ duration: 0.42, delay: index * 0.05 }}
            >
              <div className="stat-card-top">
                <div className={`stat-icon tone-${card.tone}`}>
                  <Icon size={18} />
                </div>
                <span>{card.label}</span>
              </div>
              <strong>{card.value}</strong>
              <p>{card.description}</p>
            </motion.article>
          );
        })}

        <motion.article className="progress-card" {...cardMotion} transition={{ duration: 0.45, delay: 0.15 }}>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Execution health</p>
              <h3>Completion progress</h3>
            </div>
            <div className="count-pill accent">
              <Target size={16} />
              {metrics.progress}%
            </div>
          </div>

          <p className="support-copy">
            {metrics.completed} completed, {metrics.pending} still in motion, and {metrics.dueSoon} due soon.
          </p>

          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.progress}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="priority-stack">
            {metrics.priorityBreakdown.map((item) => (
              <div key={item.name} className="priority-row">
                <div className="legend-label">
                  <span className="legend-dot" style={{ backgroundColor: item.color }} />
                  {item.name} Priority
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </motion.article>
      </div>

      <motion.article className="chart-card" {...cardMotion} transition={{ duration: 0.48, delay: 0.2 }}>
        <div className="card-heading">
          <div>
            <p className="eyebrow">Board distribution</p>
            <h3>Task mix by status</h3>
          </div>
          <div className="count-pill">{metrics.total} items</div>
        </div>

        <div className="chart-shell">
          {metrics.total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.statusChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={4}
                  stroke="none"
                >
                  {metrics.statusChartData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              <span>No data yet</span>
              <p>Create your first task to light up the dashboard.</p>
            </div>
          )}
        </div>

        <div className="legend-stack">
          {metrics.statusChartData.map((item) => (
            <div key={item.name} className="legend-item">
              <div className="legend-label">
                <span className="legend-dot" style={{ backgroundColor: item.color }} />
                {item.name}
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </motion.article>
    </section>
  );
}
