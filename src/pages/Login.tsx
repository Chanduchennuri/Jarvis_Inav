import { Camera, Terminal } from "lucide-react";

interface LoginProps {
  onFaceLogin: () => void;
  onTerminalLogin: () => void;
}

export default function Login({
  onFaceLogin,
  onTerminalLogin,
}: LoginProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-slate-100">
      <div className="w-full max-w-md">

        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.4em] text-cyan-400">
            J A R V I S
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Identify yourself
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Choose how you want to access your system.
          </p>
        </div>

        <div className="space-y-4">

          {/* Face login */}
          <button
            onClick={onFaceLogin}
            className="group flex w-full items-center gap-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10">
              <Camera className="text-cyan-300" />
            </div>

            <div>
              <h2 className="font-medium">
                Face verification
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Verify your identity using the camera.
              </p>
            </div>
          </button>

          {/* Terminal login */}
          <button
            onClick={onTerminalLogin}
            className="group flex w-full items-center gap-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-left transition hover:border-slate-600 hover:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
              <Terminal className="text-slate-300" />
            </div>

            <div>
              <h2 className="font-medium">
                Terminal access
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Access JARVIS through the command terminal.
              </p>
            </div>
          </button>

        </div>

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-widest text-slate-700">
          SECURE PERSONAL ACCESS
        </p>
      </div>
    </main>
  );
}