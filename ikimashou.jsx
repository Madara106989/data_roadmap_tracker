import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const PHASES = {
  ANALYST: "Analyst Foundation",
  ADV_ANALYST: "Advanced Analyst",
  DATA_SCIENTIST: "Data Scientist"
};

const PHASE_TASKS = {
  ANALYST: [
    { id: 1, name: "Python (Pandas / NumPy)", hrs: 0.5 },
    { id: 2, name: "SQL (Core Queries)", hrs: 0.5 },
    { id: 3, name: "Statistics Basics", hrs: 0.3 },
    { id: 4, name: "Data Visualization / BI", hrs: 0.3 },
    { id: 5, name: "Mini Analysis Project", hrs: 0.5 },
    { id: 6, name: "DSA (Arrays / Strings)", hrs: 0.3 }
  ],
  ADV_ANALYST: [
    { id: 1, name: "Advanced SQL / Windows", hrs: 0.7 },
    { id: 2, name: "Feature Engineering", hrs: 0.6 },
    { id: 3, name: "Business Case Analysis", hrs: 0.6 },
    { id: 4, name: "Dashboard Project", hrs: 0.8 },
    { id: 5, name: "Python Optimization", hrs: 0.5 },
    { id: 6, name: "DSA (Hashing / Two Pointer)", hrs: 0.3 }
  ],
  DATA_SCIENTIST: [
    { id: 1, name: "Machine Learning Models", hrs: 1 },
    { id: 2, name: "Model Evaluation", hrs: 0.7 },
    { id: 3, name: "End-to-End ML Project", hrs: 1.5 },
    { id: 4, name: "Deployment (Streamlit/Flask)", hrs: 0.8 },
    { id: 5, name: "Research / Reading", hrs: 0.5 },
    { id: 6, name: "DSA (Interview Revision)", hrs: 0.3 }
  ]
};

export default function RoadmapTracker() {
  const today = new Date().toISOString().split("T")[0];
  const monthKey = today.slice(0, 7);

  const stored = JSON.parse(localStorage.getItem("roadmapData")) || {};
  const currentPhase = stored.phase || "ANALYST";
  const tasks = PHASE_TASKS[currentPhase];

  const todayCompleted = stored[today]?.completed || {};
  const todayHours = stored[today]?.hours || 0;

  const [completed, setCompleted] = useState(todayCompleted);
  const [phase, setPhase] = useState(currentPhase);
  const [streak, setStreak] = useState(stored.streak || 0);
  const [hours, setHours] = useState(todayHours);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("roadmapData")) || {};
    data[today] = { completed, hours };
    data.phase = phase;
    data.streak = streak;
    localStorage.setItem("roadmapData", JSON.stringify(data));
  }, [completed, phase, streak, hours]);

  const toggleTask = (task) => {
    setCompleted((prev) => {
      const updated = { ...prev, [task.id]: !prev[task.id] };
      setHours((h) => prev[task.id] ? h - task.hrs : h + task.hrs);
      return updated;
    });
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const pieData = [
    { name: "Completed", value: completedCount },
    { name: "Remaining", value: tasks.length - completedCount }
  ];

  const barData = tasks.map((t) => ({
    name: t.name,
    done: completed[t.id] ? 1 : 0
  }));

  const endDay = () => {
    setStreak(completedCount > 0 ? streak + 1 : 0);
  };

  const monthlyHours = Object.entries(stored)
    .filter(([k]) => k.startsWith(monthKey))
    .reduce((sum, [, v]) => sum + (v.hours || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white p-6 grid gap-6">
      <h1 className="text-3xl font-bold">Data Career Tracker</h1>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4 flex justify-between">
          <div>
            <p className="text-lg">Current Phase</p>
            <p className="text-sm text-zinc-400">{PHASES[phase]}</p>
          </div>
          <select value={phase} onChange={(e) => setPhase(e.target.value)} className="bg-black border border-zinc-700 p-2 rounded">
            {Object.keys(PHASES).map((p) => <option key={p} value={p}>{PHASES[p]}</option>)}
          </select>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Today's Tasks</h2>
          {tasks.map((task) => (
            <div key={task.id} className="flex justify-between items-center border border-zinc-800 p-2 rounded-xl mb-2">
              <span>{task.name} ({task.hrs}h)</span>
              <Button className={completed[task.id] ? "bg-green-600" : "border border-zinc-700"} onClick={() => toggleTask(task)}>
                <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                {completed[task.id] ? "Done" : "Mark"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Daily Progress</h2>
          <Progress value={progress} className="bg-zinc-800 [&>div]:bg-green-500" />
          <p className="mt-2">{progress}% completed | {hours.toFixed(1)} hrs today</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardContent className="p-4">
            <PieChart width={250} height={250}>
              <Pie data={pieData} dataKey="value" outerRadius={80}>
                {pieData.map((_, i) => <Cell key={i} fill="#2563eb" />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border border-zinc-800">
          <CardContent className="p-4">
            <BarChart width={300} height={250} data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="done" fill="#2563eb" />
            </BarChart>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">📊 Monthly Summary</h2>
          <p>Total hours this month: <span className="text-blue-400 font-bold">{monthlyHours.toFixed(1)} hrs</span></p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">🔥 Streak</h2>
          <p className="text-2xl font-bold">{streak} days</p>
          <Button className="mt-2 bg-green-600" onClick={endDay}>End Day</Button>
        </CardContent>
      </Card>
    </div>
  );
}
