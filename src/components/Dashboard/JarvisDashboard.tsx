import type { ReactNode } from "react";

import {
  CheckCircle2,
  Clock3,
  ListTodo,
  Activity,
} from "lucide-react";

import { useJarvis } from "../../context/JarvisContext";

export default function JarvisDashboard() {
  const {
    state,
    createTask,
    completeTask,
  } = useJarvis();

  const pendingTasks = state.tasks.filter(
    (task) => task.status === "pending"
  );

  const completedTasks = state.tasks.filter(
    (task) => task.status === "completed"
  );

  const handleCreateTask = () => {
    const title = window.prompt(
      "What task should I create?"
    );

    if (title) {
      createTask(title);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">

      {/* Header */}

      <header className="border-b border-slate-800 bg-[#030914]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <div>
            <p className="font-mono text-[10px] tracking-[0.45em] text-cyan-400">
              J A R V I S
            </p>

            <h1 className="mt-2 text-2xl font-semibold">
              Good evening, Boss.
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Here's what's happening today.
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            <span className="font-mono text-xs text-slate-500">
              SYSTEM ONLINE
            </span>
          </div>

        </div>
      </header>

      {/* Content */}

      <section className="mx-auto max-w-7xl px-5 py-8">

        {/* Stats */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<ListTodo size={18} />}
            label="Pending tasks"
            value={pendingTasks.length}
          />

          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Completed"
            value={completedTasks.length}
          />

          <StatCard
            icon={<Clock3 size={18} />}
            label="Events"
            value={state.events.length}
          />

          <StatCard
            icon={<Activity size={18} />}
            label="Activities"
            value={state.timeline.length}
          />

        </div>

        {/* Main grid */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">

          {/* Tasks */}

          <section className="rounded-2xl border border-slate-800 bg-slate-950/50">

            <div className="flex items-center justify-between border-b border-slate-800 p-5">

              <div>
                <p className="font-mono text-[10px] tracking-widest text-cyan-400">
                  TASK CENTER
                </p>

                <h2 className="mt-1 text-lg font-medium">
                  Today's tasks
                </h2>
              </div>

              <button
                onClick={handleCreateTask}
                className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs text-cyan-300 transition hover:bg-cyan-400/10"
              >
                + New task
              </button>

            </div>

            <div className="divide-y divide-slate-800">

              {state.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-5"
                >

                  <button
                    onClick={() => {
                      if (task.status === "pending") {
                        completeTask(task.id);
                      }
                    }}
                    className="shrink-0"
                  >
                    <CheckCircle2
                      size={20}
                      className={
                        task.status === "completed"
                          ? "text-emerald-400"
                          : "text-slate-700 hover:text-cyan-400"
                      }
                    />
                  </button>

                  <div className="min-w-0">
                    <p
                      className={
                        task.status === "completed"
                          ? "truncate text-sm text-slate-600 line-through"
                          : "truncate text-sm text-slate-200"
                      }
                    >
                      {task.title}
                    </p>

                    <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-slate-700">
                      {task.status}
                    </p>
                  </div>

                </div>
              ))}

            </div>

          </section>

          {/* Timeline */}

          <section className="rounded-2xl border border-slate-800 bg-slate-950/50">

            <div className="border-b border-slate-800 p-5">
              <p className="font-mono text-[10px] tracking-widest text-cyan-400">
                ACTIVITY
              </p>

              <h2 className="mt-1 text-lg font-medium">
                Timeline
              </h2>
            </div>

            <div className="p-5">

              <div className="space-y-6">

                {state.timeline.map((item) => (
                  <div
                    key={item.id}
                    className="relative pl-6"
                  >

                    <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-cyan-400" />

                    <p className="text-sm text-slate-300">
                      {item.title}
                    </p>

                    <p className="mt-1 font-mono text-[9px] text-slate-700">
                      {new Date(
                        item.timestamp
                      ).toLocaleTimeString()}
                    </p>

                  </div>
                ))}

              </div>

            </div>

          </section>

        </div>

      </section>
    </main>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
}

function StatCard({
  icon,
  label,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">

      <div className="flex items-center justify-between">

        <div className="text-cyan-400">
          {icon}
        </div>

        <span className="font-mono text-2xl text-slate-200">
          {value}
        </span>

      </div>

      <p className="mt-4 text-xs text-slate-500">
        {label}
      </p>

    </div>
  );
}