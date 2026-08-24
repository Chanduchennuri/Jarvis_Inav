import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, LockKeyhole, Terminal as TerminalIcon } from "lucide-react";

interface TerminalLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

type TerminalLine = {
  type: "system" | "input" | "success" | "error";
  text: string;
};

export default function TerminalLogin({
  onSuccess,
  onBack,
}: TerminalLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"username" | "password" | "login">(
    "username"
  );

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: "system",
      text: "JARVIS SECURITY TERMINAL v0.1",
    },
    {
      type: "system",
      text: "Initializing secure personal access interface...",
    },
    {
      type: "system",
      text: "Connection established.",
    },
    {
      type: "system",
      text: "",
    },
  ]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({
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
        type,
        text,
      },
    ]);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (step === "username") {
      if (!username.trim()) {
        addLine("error", "Username cannot be empty.");
        return;
      }

      addLine("input", `username: ${username}`);

      setStep("password");
      return;
    }

    if (step === "password") {
      if (!password.trim()) {
        addLine("error", "Password cannot be empty.");
        return;
      }

      addLine(
        "input",
        `password: ${"•".repeat(password.length)}`
      );

      setStep("login");

      addLine("system", "");
      addLine("system", "Authenticating...");
      
      setTimeout(() => {
        addLine("system", "Verifying credentials...");
      }, 500);

      setTimeout(() => {
        addLine("success", "ACCESS GRANTED");
        addLine(
          "success",
          "Welcome back, Boss."
        );
      }, 1200);

      setTimeout(() => {
        onSuccess();
      }, 2200);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-4 text-slate-200 sm:px-6 sm:py-6">

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#050b14] shadow-2xl">

        {/* Terminal header */}
        <header className="flex h-12 items-center justify-between border-b border-slate-800 bg-[#080f1a] px-4">

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <TerminalIcon
                size={14}
                className="text-cyan-400"
              />

              <span className="font-mono text-xs text-slate-500">
                jarvis@localhost:~
              </span>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs text-slate-500 transition hover:text-slate-200"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </header>

        {/* Terminal body */}
        <section className="flex flex-1 flex-col">

          <div className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-6 sm:p-8 sm:text-sm">

            {lines.map((line, index) => (
              <div
                key={`${index}-${line.text}`}
                className={
                  line.type === "success"
                    ? "text-emerald-400"
                    : line.type === "error"
                    ? "text-red-400"
                    : line.type === "input"
                    ? "text-slate-300"
                    : "text-slate-500"
                }
              >
                {line.text}
              </div>
            ))}

            <div className="mt-4 flex items-center gap-2 text-cyan-400">
              <span>system@jarvis:~$</span>

              {step === "username" && (
                <span>login</span>
              )}

              {step === "password" && (
                <span>authenticate</span>
              )}
            </div>

            <div ref={terminalEndRef} />
          </div>

          {/* Input */}
          {step !== "login" && (
            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-800 bg-black/20 p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">

                <span className="shrink-0 text-cyan-400">
                  {step === "username"
                    ? "username:"
                    : "password:"}
                </span>

                <input
                  ref={inputRef}
                  type={
                    step === "password"
                      ? "password"
                      : "text"
                  }
                  value={
                    step === "username"
                      ? username
                      : password
                  }
                  onChange={(event) => {
                    if (step === "username") {
                      setUsername(event.target.value);
                    } else {
                      setPassword(event.target.value);
                    }
                  }}
                  placeholder={
                    step === "username"
                      ? "enter username"
                      : "enter password"
                  }
                  className="min-w-0 flex-1 bg-transparent text-slate-200 outline-none placeholder:text-slate-700"
                  autoComplete="off"
                />

                <button
                  type="submit"
                  className="hidden rounded border border-cyan-400/20 px-3 py-1 text-cyan-400 hover:bg-cyan-400/10 sm:block"
                >
                  ENTER
                </button>
              </div>

              <p className="mt-3 text-[10px] text-slate-700">
                Press Enter to continue
              </p>
            </form>
          )}

          {/* Authenticating */}
          {step === "login" && (
            <div className="flex items-center gap-3 border-t border-slate-800 p-5 font-mono text-xs text-cyan-400">
              <LockKeyhole
                size={14}
                className="animate-pulse"
              />

              <span>
                Establishing secure session...
              </span>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.25em] text-slate-700">
          JARVIS // SECURE TERMINAL ACCESS
        </footer>
      </div>
    </main>
  );
}