import type { ReactNode } from "react";
import { useState } from "react";

import {
  CheckCircle2,
  Clock3,
  ListTodo,
  Activity,
  Mic,
  Terminal,
} from "lucide-react";

import { useJarvis } from "../../context/JarvisContext";
import JarvisVoice from "../Voice/JarvisVoice";
import JarvisTerminal from "../../components/Terminal/JarvisTerminal";

export default function JarvisDashboard() {
  const {
    state,
    createTask,
    completeTask,
  } = useJarvis();

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

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

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-800 bg-[#030914]/80 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          {/* Brand */}

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

          {/* Controls */}

          <div className="flex items-center gap-2">

            {/* Voice */}

            <button
              onClick={() => {
                setVoiceOpen(true);
                setTerminalOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 font-mono text-xs text-cyan-300 transition hover:bg-cyan-400/10"
            >
              <Mic size={14} />

              <span className="hidden sm:inline">
                VOICE
              </span>
            </button>

            {/* Terminal */}

            <button
              onClick={() => {
                setTerminalOpen(true);
                setVoiceOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 font-mono text-xs text-cyan-300 transition hover:bg-cyan-400/10"
            >
              <Terminal size={14} />

              <span className="hidden sm:inline">
                TERMINAL
              </span>
            </button>

            {/* System status */}

            <div className="ml-2 hidden items-center gap-3 lg:flex">

              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              <span className="font-mono text-xs text-slate-500">
                SYSTEM ONLINE
              </span>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-8">

        {/* ===================================================
            VOICE INTERFACE
        ==================================================== */}

        {voiceOpen && (
          <div className="mb-6">

            <JarvisVoice
              onClose={() => setVoiceOpen(false)}
            />

          </div>
        )}


        {/* ===================================================
            TERMINAL INTERFACE
        ==================================================== */}

        {terminalOpen && (
          <div className="mb-6">

            <JarvisTerminal
              onClose={() => setTerminalOpen(false)}
            />

          </div>
        )}


        {/* ===================================================
            STATS
        ==================================================== */}

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


        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">


          {/* =================================================
              TASKS
          ================================================== */}

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


            {/* Task list */}

            <div className="divide-y divide-slate-800">

              {state.tasks.length === 0 ? (

                <div className="p-8 text-center">

                  <p className="text-sm text-slate-600">
                    No tasks yet.
                  </p>

                  <p className="mt-1 font-mono text-[10px] text-slate-700">
                    Use VOICE or TERMINAL to create one.
                  </p>

                </div>

              ) : (

                state.tasks.map((task) => (

                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-5"
                  >

                    {/* Complete button */}

                    <button
                      onClick={() => {

                        if (
                          task.status === "pending"
                        ) {
                          completeTask(task.id);
                        }

                      }}
                      disabled={
                        task.status === "completed"
                      }
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


                    {/* Task information */}

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

                ))

              )}

            </div>

          </section>


          {/* =================================================
              TIMELINE
          ================================================== */}

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

                {state.timeline.length === 0 ? (

                  <p className="text-sm text-slate-600">
                    No activity yet.
                  </p>

                ) : (

                  state.timeline.map((item) => (

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

                  ))

                )}

              </div>

            </div>

          </section>

        </div>

      </section>

    </main>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

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