import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">{label}</p>
      <p className="opacity-70">Stress: {payload[0]?.value}%</p>
    </div>
  );
};

export default function MoodChart({ data = [] }) {
  const formatted = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    stress: d.stressLevel,
  }));

  if (!formatted.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-48 flex items-center justify-center text-sm opacity-60"
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🌱</div>
          <p>Not enough days yet — share a moment when you're ready.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="h-48"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dca97a" stopOpacity={0.45} />
              <stop offset="50%" stopColor="#94b491" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#94b491" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="moodStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c08a5a" />
              <stop offset="100%" stopColor="#6c9469" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="stress"
            stroke="url(#moodStroke)"
            strokeWidth={2.5}
            fill="url(#moodGrad)"
            dot={false}
            activeDot={{
              r: 5,
              fill: '#c08a5a',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
