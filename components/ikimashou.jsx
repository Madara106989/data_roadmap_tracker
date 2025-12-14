// components/ikimashou.jsx
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Simple UI primitives (black theme)
function Card({ className = "", children }) {
  return <div className={`rounded-xl bg-zinc-900 border border-zinc-800 ${className}`}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm font-medium bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition ${className}`}
    >
      {children}
    </button>
  );
}

function Progress({ value, className = "" }) {
  return (
    <div className={`w-full h-2 rounded bg-zinc-800 overflow-hidden ${className}`}>
      <div
        className="h-2 rounded bg-green-500 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

const PHASES = {
  ANALYST: "Analyst Foundation",
  ADV_ANALYST: "Advanced Analyst",
  DATA_SCIENTIST: "Data Scientist",
};

const PHASE_TASKS = {
  ANALYST: [
    { id: 1, name: "Python (Pandas / NumPy)", hrs: 0.5 },
    { id: 2, name: "SQL (Core Queries)", hrs: 0.5 },
    { id: 3, name: "Statistics Basics", hrs: 0.3 },
    { id: 4, name: "Data Visualization / BI", hrs: 0.3 },
    { id: 5, name: "Mini Analysis Project", hrs: 0.5 },
    { id: 6, name: "DSA (Arrays / Strings)", hrs: 0.3 },
  ],
  ADV_ANALYST: [
    { id: 1, name: "Advanced SQL / Windows", hrs: 0.7 },
    { id: 2, name: "Feature Engineering", hrs: 0.6 },
    { id: 3, name: "Business Case Analysis", hrs: 0.6 },
    { id: 4, name: "Dashboard Project", hrs: 0.8 },
    { id: 5, name: "Python Optimization", hrs: 0.5 },
    { id: 6, name: "DSA (Hashing / Two Pointer)", hrs: 0.3 },
  ],
  DATA_SCIENTIST: [
    { id: 1, name: "Machine Learning Models", hrs: 1 },
    { id: 2, name: "Model Evaluation", hrs: 0.7 },
    { id: 3, name: "End-to-End ML Project", hrs: 1.5 },
    { id: 4, name: "Deployment (Streamlit/Flask)", hrs: 0.8 },
    { id: 5, name: "Research / Reading", hrs: 0.5 },
    { id: 6, name: "DSA (Interview Revision)", hrs: 0.3 },
  ],
};

export default function Ikimashou() {
  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState("ANALYST");
  const [completed, setCompleted] = useState({});
  const [streak, setStreak] = useState(0);
  const [hours, setHours] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const monthKey = today.slice(0, 7);

  // initial load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("roadmapData")) || {};
    const currentPhase = stored.phase || "ANALYST";
    const todayCompleted = stored[today]?.completed || {};
    const todayHours = stored[today]?.hours || 0;

    setPhase(currentPhase);
    setCompleted(todayCompleted);
    setStreak(stored.streak || 0);
    setHours(todayHours);
    setIsReady(true);
  }, [today]);

  // persist to localStorage
  useEffect(() => {
    if (!isReady) return;
    const data = JSON.parse(localStorage.getItem("roadmapData")) || {};
    data[today] = { completed, hours };
    data.phase = phase;
    data.streak = streak;
    localStorage.setItem("roadmapData", JSON.stringify(data));
  }, [completed, phase, streak, hours, today, isReady]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading your roadmap…</p>
      </div>
    );
  }

  const stored = JSON.parse(localStorage.getItem("roadmapData")) || {};
  const tasks = PHASE_TASKS[phase];

  const toggleTask = (task) => {
    setCompleted((prev) => {
      const updated = { ...prev, [task.id]: !prev[task.id] };
      setHours((h) => (prev[task.id] ? h - task.hrs : h + task.hrs));
      return updated;
    });
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const pieData = [
    { name: "Completed", value: completedCount },
    { name: "Remaining", value: tasks.length - completedCount },
  ];

  const barData = tasks.map((t) => ({
    name: t.name,
    done: completed[t.id] ? 1 : 0,
  }));

  const endDay = () => {
    setStreak(completedCount > 0 ? streak + 1 : 0);
  };

  const monthlyHours = Object.entries(stored)
    .filter(([k]) => k.startsWith(monthKey))
    .reduce((sum, [, v]) => sum + (v.hours || 0), 0);

  const monthEntries = Object.entries(stored)
    .filter(([k]) => k.startsWith(monthKey))
    .sort(([a], [b]) => (a > b ? 1 : -1));

  const monthBarData = monthEntries.map(([date, v]) => ({
    day: date.slice(-2),
    hours: v.hours || 0,
  }));

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Roadmap Tracker</h1>
          <p className="text-sm text-zinc-400">
            Plan, execute, and visualize your data career progress.
          </p>
        </div>
        <div className="text-xs text-right text-zinc-400 space-y-1">
          <p>
            Phase:{" "}
            <span className="text-blue-400 font-semibold">
              {PHASES[phase]}
            </span>
          </p>
          <p>
            Streak:{" "}
            <span className="text-green-400 font-semibold">
              {streak} days 🔥
            </span>
          </p>
          <p>
            Today:{" "}
            <span className="font-mono text-zinc-300">
              {today}
            </span>
          </p>
        </div>
      </header>

      {/* MAIN GRID: LEFT TASKS, RIGHT GRAPHS */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Phase card */}
          <Card>
            <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Current Phase
                </p>
                <p className="text-lg font-semibold">{PHASES[phase]}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {tasks.length} focused tasks scheduled for today.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="bg-black border border-zinc-700 text-sm px-3 py-2 rounded outline-none"
                >
                  {Object.keys(PHASES).map((p) => (
                    <option key={p} value={p}>
                      {PHASES[p]}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500">
                  Hours today:{" "}
                  <span className="text-blue-400 font-semibold">
                    {hours.toFixed(1)}h
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Today's tasks */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-3">Today&apos;s Tasks</h2>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center border border-zinc-800 bg-zinc-950/60 p-2 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{task.name}</p>
                      <p className="text-xs text-zinc-500">
                        {task.hrs}h • ID {task.id}
                      </p>
                    </div>
                    <Button
                      className={
                        completed[task.id]
                          ? "bg-green-600 border-green-500 text-black"
                          : ""
                      }
                      onClick={() => toggleTask(task)}
                    >
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {completed[task.id] ? "Done" : "Mark"}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily progress */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="text-xl font-semibold">Daily Progress</h2>
              <Progress value={progress} />
              <p className="text-sm text-zinc-300">
                {progress}% completed •{" "}
                <span className="text-blue-400 font-semibold">
                  {hours.toFixed(1)} hrs
                </span>{" "}
                logged today
              </p>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <p>
                  Completed tasks:{" "}
                  <span className="text-green-400 font-semibold">
                    {completedCount}/{tasks.length}
                  </span>
                </p>
                <Button className="bg-green-600 text-black" onClick={endDay}>
                  End Day
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: CHARTS */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">
                Today&apos;s Overview
              </h2>
              <div className="flex justify-center">
                <PieChart width={260} height={220}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={80}
                    innerRadius={50}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={index === 0 ? "#22c55e" : "#27272a"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      border: "1px solid #3f3f46",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </div>
              <div className="flex justify-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-green-500" /> Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-zinc-700" /> Remaining
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">
                Task Completion (Today)
              </h2>
              <BarChart width={360} height={220} data={barData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={{ stroke: "#52525b" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={{ stroke: "#52525b" }}
                  domain={[0, 1]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="done" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
              <p className="mt-2 text-xs text-zinc-500">
                Each bar shows whether a task is done (1) or not (0) today.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BOTTOM: MONTHLY PROGRESS */}
      <section className="mt-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
              <div>
                <h2 className="text-xl font-semibold">📅 Monthly Progress</h2>
                <p className="text-xs text-zinc-400">
                  {monthBarData.length} days tracked in {monthKey} •{" "}
                  <span className="text-blue-400 font-semibold">
                    {monthlyHours.toFixed(1)} hrs
                  </span>{" "}
                  total
                </p>
              </div>
            </div>

            {monthBarData.length === 0 ? (
              <p className="text-sm text-zinc-500 mt-4">
                No data for this month yet. Start completing tasks to see your
                streak chart here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <BarChart
                  width={Math.max(600, monthBarData.length * 24)}
                  height={200}
                  data={monthBarData}
                >
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    tickLine={{ stroke: "#52525b" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    tickLine={{ stroke: "#52525b" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      border: "1px solid #3f3f46",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="#22c55e"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
