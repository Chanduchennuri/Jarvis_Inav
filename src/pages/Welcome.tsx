import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

interface WelcomeProps {
  onComplete: () => void;
}

export default function Welcome({ onComplete }: WelcomeProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing core systems");

  useEffect(() => {
    const statuses = [
      "Initializing core systems",
      "Loading neural interface",
      "Preparing memory system",
      "Initializing command center",
      "JARVIS is ready",
    ];

    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);

        setStatus(statuses[4]);

        setTimeout(() => {
          onComplete();
        }, 800);
      } else {
        const index = Math.min(
          Math.floor(currentProgress / 25),
          statuses.length - 2
        );

        setStatus(statuses[index]);
      }

      setProgress(currentProgress);
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-6 text-slate-100">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* JARVIS icon */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/5 shadow-[0_0_50px_rgba(34,211,238,0.12)]">
          <Cpu
            size={38}
            strokeWidth={1.5}
            className="text-cyan-300"
          />
        </div>

        {/* Brand */}
        <div className="mb-2 text-xs font-medium tracking-[0.5em] text-cyan-400">
          J A R V I S
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome SekharChennuri(Admin)
        </h1>

        <p className="mt-3 text-sm text-slate-400">
          Your personal intelligence system
        </p>

        {/* Progress */}
        <div className="mt-12 w-full">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">{status}</span>
            <span className="font-mono text-cyan-400">
              {progress}%
            </span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading dots */}
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"
              style={{
                animationDelay: `${dot * 200}ms`,
              }}
            />
          ))}
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
          JARVIS IS SETTING UP
        </p>
      </div>
    </main>
  );
}