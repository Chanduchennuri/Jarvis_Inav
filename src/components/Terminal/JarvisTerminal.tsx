import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { useJarvis } from "../../context/JarvisContext";

interface TerminalLine {
  id: number;
  type: "input" | "output" | "success" | "error";
  text: string;
}

interface JarvisTerminalProps {
  onClose?: () => void;
}

export default function JarvisTerminal({
  onClose,
}: JarvisTerminalProps) {
  const {
    state,
    createTask,
    completeTask,
    deleteTask,
  } = useJarvis();

  const [command, setCommand] = useState("");

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 1,
      type: "output",
      text: "JARVIS COMMAND TERMINAL v1.0",
    },
    {
      id: 2,
      type: "output",
      text: "Type 'help' to view available commands.",
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines]);

  const addLine = (
    type: TerminalLine["type"],
    text: string
  ) => {
    setLines((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        type,
        text,
      },
    ]);
  };

  const executeCommand = (rawCommand: string) => {
    const input = rawCommand.trim();

    if (!input) {
      return;
    }

    addLine(
      "input",
      `boss@jarvis:~$ ${input}`
    );

    const parts = input.split(" ");
    const command = parts[0].toLowerCase();

    // HELP
    if (command === "help") {
      addLine(
        "output",
        "Available commands:"
      );

      addLine(
        "output",
        "  help"
      );

      addLine(
        "output",
        "  status"
      );

      addLine(
        "output",
        "  tasks"
      );

      addLine(
        "output",
        "  task create <title>"
      );

      addLine(
        "output",
        "  task complete <number>"
      );

      addLine(
        "output",
        "  task delete <number>"
      );

      addLine(
        "output",
        "  clear"
      );

      return;
    }

    // STATUS
    if (command === "status") {
      addLine(
        "success",
        "JARVIS SYSTEM ONLINE"
      );

      addLine(
        "output",
        `Tasks: ${state.tasks.length}`
      );

      addLine(
        "output",
        `Events: ${state.events.length}`
      );

      addLine(
        "output",
        `Timeline entries: ${state.timeline.length}`
      );

      return;
    }

    // TASKS
    if (command === "tasks") {
      if (state.tasks.length === 0) {
        addLine(
          "output",
          "No tasks found."
        );

        return;
      }

      state.tasks.forEach((task, index) => {
        const symbol =
          task.status === "completed"
            ? "✓"
            : "○";

        addLine(
          task.status === "completed"
            ? "success"
            : "output",
          `${index + 1}. ${symbol} ${task.title}`
        );
      });

      return;
    }

    // TASK COMMANDS
    if (command === "task") {
      const action =
        parts[1]?.toLowerCase();

      // CREATE
      if (action === "create") {
        const title = parts
          .slice(2)
          .join(" ")
          .trim();

        if (!title) {
          addLine(
            "error",
            "Usage: task create <title>"
          );

          return;
        }

        createTask(title);

        addLine(
          "success",
          `Task created: ${title}`
        );

        return;
      }

      // COMPLETE
      if (action === "complete") {
        const number = Number(parts[2]);

        if (!number || number < 1) {
          addLine(
            "error",
            "Usage: task complete <number>"
          );

          return;
        }

        const task =
          state.tasks[number - 1];

        if (!task) {
          addLine(
            "error",
            `Task ${number} does not exist.`
          );

          return;
        }

        completeTask(task.id);

        addLine(
          "success",
          `Completed: ${task.title}`
        );

        return;
      }

      // DELETE
      if (action === "delete") {
        const number = Number(parts[2]);

        if (!number || number < 1) {
          addLine(
            "error",
            "Usage: task delete <number>"
          );

          return;
        }

        const task =
          state.tasks[number - 1];

        if (!task) {
          addLine(
            "error",
            `Task ${number} does not exist.`
          );

          return;
        }

        deleteTask(task.id);

        addLine(
          "success",
          `Deleted: ${task.title}`
        );

        return;
      }

      addLine(
        "error",
        "Unknown task command. Type 'help'."
      );

      return;
    }

    // CLEAR
    if (command === "clear") {
      setLines([]);
      return;
    }

    // UNKNOWN
    addLine(
      "error",
      `Command not found: ${command}`
    );

    addLine(
      "output",
      "Type 'help' to see available commands."
    );
  };

  const handleSubmit = (
    event: FormEvent
  ) => {
    event.preventDefault();

    executeCommand(command);

    setCommand("");
  };

  return (
    <section className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#030811] shadow-2xl">

      {/* Header */}

      <header className="flex items-center justify-between border-b border-slate-800 bg-[#080f1a] px-4 py-3">

        <div className="flex items-center gap-3">

          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>

          <span className="font-mono text-[10px] text-slate-500">
            jarvis@localhost:~
          </span>

        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-300"
          >
            close
          </button>
        )}

      </header>

      {/* Terminal output */}

      <div
        ref={terminalRef}
        onClick={() =>
          inputRef.current?.focus()
        }
        className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-6 sm:text-sm"
      >

        {lines.map((line) => (
          <div
            key={line.id}
            className={
              line.type === "input"
                ? "text-cyan-300"
                : line.type === "success"
                ? "text-emerald-400"
                : line.type === "error"
                ? "text-red-400"
                : "text-slate-500"
            }
          >
            {line.text}
          </div>
        ))}

      </div>

      {/* Command input */}

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-800 bg-black/20 px-5 py-4"
      >

        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">

          <span className="shrink-0 text-cyan-400">
            boss@jarvis:~$
          </span>

          <input
            ref={inputRef}
            value={command}
            onChange={(event) =>
              setCommand(event.target.value)
            }
            className="min-w-0 flex-1 bg-transparent text-slate-200 outline-none"
            autoComplete="off"
            spellCheck={false}
            placeholder="type a command..."
          />

        </div>

      </form>

    </section>
  );
}