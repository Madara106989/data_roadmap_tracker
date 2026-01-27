"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const PHASE_ORDER = ["ANALYST", "ADV_ANALYST", "DATA_SCIENTIST"];

const PHASES = {
  ANALYST: "Analyst Foundation",
  ADV_ANALYST: "Advanced Analyst",
  DATA_SCIENTIST: "Data Scientist"
};

const DEFAULT_TASKS = {
  ANALYST: [
    { id: 1, name: "Python (Pandas / NumPy)", hrs: 2 },
    { id: 2, name: "SQL Practice", hrs: 2 }
  ],
  ADV_ANALYST: [
    { id: 1, name: "Advanced SQL", hrs: 2 },
    { id: 2, name: "Feature Engineering", hrs: 2 }
  ],
  DATA_SCIENTIST: [
    { id: 1, name: "ML Models", hrs: 3 },
    { id: 2, name: "End-to-End Project", hrs: 3 }
  ]
};

export default function Page() {
  const today = new Date().toISOString().split("T")[0];
  const monthKey = today.slice(0, 7);

  const stored =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("roadmapData")) || {}
      : {};

  const [phase, setPhase] = useState(stored.phase || "ANALYST");
  const [tasksByPhase, setTasksByPhase] = useState(
    stored.tasksByPhase || DEFAULT_TASKS
  );
  const [completed, setCompleted] = useState(
    stored[today]?.completed || {}
  );
  const [hours, setHours] = useState(stored[today]?.hours || 0);
  const [streak, setStreak] = useState(stored.streak || 0);

  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskHours, setNewTaskHours] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);

  const tasks = tasksByPhase[phase];

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("roadmapData")) || {};
    data[today] = {
      completed,
      hours,
      progress:
        Object.values(completed).filter(Boolean).length /
        tasks.length
    };
    data.phase = phase;
    data.streak = streak;
    data.tasksByPhase = tasksByPhase;
    localStorage.setItem("roadmapData", JSON.stringify(data));
  }, [completed, hours, phase, streak, tasksByPhase]);

  const toggleTask = (task) => {
    setCompleted((prev) => {
      const updated = { ...prev, [task.id]: !prev[task.id] };
      setHours((h) =>
        prev[task.id] ? h - task.hrs : h + task.hrs
      );
      return updated;
    });
  };

  const addTask = () => {
    if (!newTaskName || !newTaskHours) return;

    const newTask = {
      id: Date.now(),
      name: newTaskName,
      hrs: parseFloat(newTaskHours)
    };

    setTasksByPhase((prev) => ({
      ...prev,
      [phase]: [...prev[phase], newTask]
    }));

    setNewTaskName("");
    setNewTaskHours("");
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setNewTaskName(task.name);
    setNewTaskHours(task.hrs);
  };

  const saveEdit = () => {
    setTasksByPhase((prev) => ({
      ...prev,
      [phase]: prev[phase].map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              name: newTaskName,
              hrs: parseFloat(newTaskHours)
            }
          : t
      )
    }));
    setEditingTaskId(null);
    setNewTaskName("");
    setNewTaskHours("");
  };

  const deleteTask = (id) => {
    setTasksByPhase((prev) => ({
      ...prev,
      [phase]: prev[phase].filter((t) => t.id !== id)
    }));
  };

  const completedCount =
    Object.values(completed).filter(Boolean).length;
  const progress = Math.round(
    (completedCount / tasks.length) * 100
  );

  const monthlyHours = Object.entries(stored)
    .filter(([k]) => k.startsWith(monthKey))
    .reduce((sum, [, v]) => sum + (v.hours || 0), 0);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    return {
      date: key.slice(5),
      hours: stored[key]?.hours || 0
    };
  }).reverse();

  const avg7 =
    last7Days.reduce((a, b) => a + b.hours, 0) / 7;

  const burnout = avg7 > 5;

  return (
    <div className="min-h-screen bg-black text-white p-6 grid gap-6">
      <h1 className="text-3xl font-bold">
        Data Career Tracker
      </h1>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4 flex justify-between">
          <div>
            <p>Phase</p>
            <p className="text-zinc-400">
              {PHASES[phase]}
            </p>
          </div>
          <select
            value={phase}
            onChange={(e) =>
              setPhase(e.target.value)
            }
            className="bg-black border p-2"
          >
            {Object.keys(PHASES).map((p) => (
              <option key={p} value={p}>
                {PHASES[p]}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4 flex gap-2">
          <input
            type="text"
            placeholder="Task Name"
            value={newTaskName}
            onChange={(e) =>
              setNewTaskName(e.target.value)
            }
            className="bg-black border p-2"
          />
          <input
            type="number"
            placeholder="Hours"
            value={newTaskHours}
            onChange={(e) =>
              setNewTaskHours(e.target.value)
            }
            className="bg-black border p-2 w-24"
          />
          {editingTaskId ? (
            <Button onClick={saveEdit}>
              Save
            </Button>
          ) : (
            <Button onClick={addTask}>
              Add
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4 grid gap-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between border p-2"
            >
              <span>
                {task.name} ({task.hrs}h)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    toggleTask(task)
                  }
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() =>
                    startEdit(task)
                  }
                >
                  Edit
                </Button>
                <Button
                  onClick={() =>
                    deleteTask(task.id)
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4">
          <Progress value={progress} />
          <p>
            {progress}% | {hours.toFixed(1)}h
            today
          </p>
          {burnout && (
            <p className="text-red-400">
              Burnout Risk (7-day avg &gt; 5h)
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4">
          <LineChart
            width={400}
            height={250}
            data={last7Days}
          >
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#2563eb"
            />
          </LineChart>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border border-zinc-800">
        <CardContent className="p-4">
          Monthly Hours:{" "}
          <span className="font-bold">
            {monthlyHours.toFixed(1)}h
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
