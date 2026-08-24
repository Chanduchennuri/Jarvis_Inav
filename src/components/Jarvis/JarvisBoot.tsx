import { useEffect, useState } from "react";
import {
  Activity,
  BrainCircuit,
  Database,
  ShieldCheck,
  Wifi,
} from "lucide-react";

interface JarvisBootProps {
  onComplete: () => void;
}

const bootMessages = [
  "Authentication accepted.",
  "Establishing secure session...",
  "Loading personal memory...",
  "Connecting cognitive systems...",
  "Initializing command interface...",
  "Synchronizing daily activity...",
  "All systems operational.",
];

const systems = [
  {
    name: "CORE",
    icon: BrainCircuit,
  },
  {
    name: "MEMORY",
    icon: Database,
  },
  {
    name: "SECURITY",
    icon: ShieldCheck,
  },
  {
    name: "NETWORK",
    icon: Wifi,
  },
  {
    name: "ACTIVITY",
    icon: Activity,
  },
];

export default function JarvisBoot({
  onComplete,
}: JarvisBootProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  /*
   * Welcome voice
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      const message = new SpeechSynthesisUtterance(
        "Welcome, Boss."
      );

      message.rate = 0.9;
      message.pitch = 0.85;
      message.volume = 1;

      message.onstart = () => {
        setSpeaking(true);
      };

      message.onend = () => {
        setSpeaking(false);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(message);
    }, 500);

    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, []);

  /*
   * Boot progress
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(interval);
          return 100;
        }

        return Math.min(
          current + Math.floor(Math.random() * 7) + 3,
          100
        );
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  /*
   * Boot messages
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((current) => {
        if (current >= bootMessages.length - 1) {
          clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 650);

    return () => clearInterval(interval);
  }, []);

  /*
   * Enter dashboard
   */
  useEffect(() => {
    if (progress < 100) {
      return;
    }

    const timer = setTimeout(() => {
      onComplete();
    }, 900);

    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-5 text-slate-100">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-3xl">

        {/* Header */}
        <div className="text-center">

          <div
            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border transition-all duration-700 ${
              speaking
                ? "border-cyan-300 bg-cyan-400/10 shadow-[0_0_80px_rgba(34,211,238,0.35)]"
                : "border-cyan-400/30 bg-cyan-400/5"
            }`}
          >
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/30 ${
                speaking ? "animate-pulse" : ""
              }`}
            >
              <span className="text-xl font-light text-cyan-300">
                J
              </span>
            </div>
          </div>

          <p className="mt-8 font-mono text-xs tracking-[0.55em] text-cyan-400">
            J A R V I S
          </p>

          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Welcome, Boss.
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Personal intelligence system is coming online.
          </p>

        </div>

        {/* Systems */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-5">

          {systems.map((system, index) => {
            const Icon = system.icon;

            const active =
              progress >= (index + 1) * 18;

            return (
              <div
                key={system.name}
                className={`rounded-xl border p-4 text-center transition-all duration-500 ${
                  active
                    ? "border-cyan-400/20 bg-cyan-400/5"
                    : "border-slate-800 bg-slate-900/30"
                }`}
              >
                <Icon
                  size={17}
                  className={`mx-auto ${
                    active
                      ? "text-cyan-400"
                      : "text-slate-700"
                  }`}
                />

                <p
                  className={`mt-2 font-mono text-[9px] tracking-widest ${
                    active
                      ? "text-slate-400"
                      : "text-slate-700"
                  }`}
                >
                  {system.name}
                </p>

                <div
                  className={`mx-auto mt-2 h-1 w-1 rounded-full ${
                    active
                      ? "bg-emerald-400"
                      : "bg-slate-800"
                  }`}
                />
              </div>
            );
          })}

        </div>

        {/* Terminal-like boot log */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-black/30 p-5">

          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
              SYSTEM BOOT
            </span>

            <span className="font-mono text-xs text-cyan-400">
              {progress}%
            </span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-slate-900">
            <div
              className="h-full bg-cyan-400 transition-all duration-200"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-5 space-y-2 font-mono text-[11px]">
            {bootMessages
              .slice(0, messageIndex + 1)
              .map((message, index) => (
                <div
                  key={message}
                  className="flex gap-3"
                >
                  <span className="text-slate-700">
                    [{String(index + 1).padStart(2, "0")}]
                  </span>

                  <span
                    className={
                      index === messageIndex
                        ? "text-cyan-300"
                        : "text-slate-600"
                    }
                  >
                    {message}
                  </span>

                  {index === messageIndex && (
                    <span className="animate-pulse text-cyan-400">
                      _
                    </span>
                  )}
                </div>
              ))}
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-700">
            {progress >= 100
              ? "SYSTEM READY"
              : "JARVIS IS SETTING UP"}
          </p>
        </div>

      </div>
    </main>
  );
}