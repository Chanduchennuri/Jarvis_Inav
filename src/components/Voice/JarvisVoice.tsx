import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, X } from "lucide-react";

import { useJarvis } from "../../context/JarvisContext";

interface JarvisVoiceProps {
  onClose?: () => void;
}

type VoiceStatus =
  | "idle"
  | "listening"
  | "processing"
  | "speaking";

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;

  start: () => void;
  stop: () => void;

  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function JarvisVoice({
  onClose,
}: JarvisVoiceProps) {
  const {
    state,
    createTask,
    completeTask,
  } = useJarvis();

  const [status, setStatus] =
    useState<VoiceStatus>("idle");

  const [transcript, setTranscript] =
    useState("");

  const [response, setResponse] =
    useState("Awaiting your command.");

  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  /*
   * Initialize browser speech recognition
   */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setResponse(
        "Speech recognition is not supported by this browser."
      );

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setStatus("listening");
      setTranscript("");
      setResponse("I'm listening.");
    };

    recognition.onresult = (
      event: SpeechRecognitionEventLike
    ) => {
      const text =
        event.results[0][0].transcript;

      setTranscript(text);
      setStatus("processing");

      processCommand(text);
    };

    recognition.onerror = () => {
      setStatus("idle");
      setResponse(
        "I couldn't understand that command."
      );
    };

    recognition.onend = () => {
      setStatus((current) =>
        current === "listening"
          ? "idle"
          : current
      );
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  /*
   * Text-to-speech
   */
  const speak = (text: string) => {
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 0.9;
    utterance.pitch = 0.85;
    utterance.volume = 1;

    utterance.onstart = () => {
      setStatus("speaking");
    };

    utterance.onend = () => {
      setStatus("idle");
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  /*
   * Command processor
   */
  const processCommand = (rawText: string) => {
    const text = rawText
      .toLowerCase()
      .replace(/^jarvis[,\s]*/i, "")
      .trim();

    /*
     * CREATE TASK
     *
     * Example:
     * "Jarvis, create a task to finish backend"
     */
    if (
      text.includes("create a task") ||
      text.includes("create task") ||
      text.includes("add a task") ||
      text.includes("add task")
    ) {
      const title = text
        .replace(
          /create a task|create task|add a task|add task/gi,
          ""
        )
        .replace(/^to\s+/i, "")
        .trim();

      if (!title) {
        const message =
          "What task would you like me to create?";

        setResponse(message);
        speak(message);
        return;
      }

      createTask(title);

      const message = `I've created the task: ${title}.`;

      setResponse(message);
      speak(message);

      return;
    }

    /*
     * SHOW TASKS
     */
    if (
      text.includes("show my tasks") ||
      text === "show tasks" ||
      text === "what are my tasks"
    ) {
      const pendingTasks =
        state.tasks.filter(
          (task) =>
            task.status === "pending"
        );

      if (pendingTasks.length === 0) {
        const message =
          "You have no pending tasks.";

        setResponse(message);
        speak(message);
        return;
      }

      const message =
        `You have ${pendingTasks.length} pending tasks. ` +
        pendingTasks
          .slice(0, 3)
          .map((task) => task.title)
          .join(", ");

      setResponse(message);
      speak(message);

      return;
    }

    /*
     * COMPLETE FIRST PENDING TASK
     */
    if (
      text.includes("complete the first task") ||
      text.includes("finish the first task")
    ) {
      const task = state.tasks.find(
        (item) => item.status === "pending"
      );

      if (!task) {
        const message =
          "There are no pending tasks.";

        setResponse(message);
        speak(message);
        return;
      }

      completeTask(task.id);

      const message =
        `I've marked ${task.title} as completed.`;

      setResponse(message);
      speak(message);

      return;
    }

    /*
     * STATUS
     */
    if (
      text === "status" ||
      text.includes("system status") ||
      text.includes("how are you")
    ) {
      const pending =
        state.tasks.filter(
          (task) =>
            task.status === "pending"
        ).length;

      const message =
        `All systems are operational. ` +
        `You have ${pending} pending tasks.`;

      setResponse(message);
      speak(message);

      return;
    }

    /*
     * HELP
     */
    if (
      text === "help" ||
      text.includes("what can you do")
    ) {
      const message =
        "I can create tasks, show your tasks, " +
        "complete tasks, and report system status.";

      setResponse(message);
      speak(message);

      return;
    }

    /*
     * UNKNOWN COMMAND
     */
    const message =
      `I don't know how to handle "${rawText}" yet.`;

    setResponse(message);
    speak(message);
  };

  /*
   * Start listening
   */
  const startListening = () => {
    if (!recognitionRef.current) {
      setResponse(
        "Speech recognition is unavailable."
      );

      return;
    }

    try {
      recognitionRef.current.start();
    } catch {
      // Browser may throw if recognition is
      // already running.
    }
  };

  /*
   * Stop listening
   */
  const stopListening = () => {
    recognitionRef.current?.stop();
    setStatus("idle");
    setResponse("Listening stopped.");
  };

  const isListening =
    status === "listening";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#030914]">

      {/* Background effect */}

      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-700 ${
          isListening
            ? "bg-cyan-400/15"
            : "bg-cyan-400/5"
        }`}
      />

      {/* Header */}

      <header className="relative flex items-center justify-between border-b border-slate-800 px-5 py-4">

        <div>
          <p className="font-mono text-[10px] tracking-[0.35em] text-cyan-400">
            VOICE INTERFACE
          </p>

          <h2 className="mt-1 text-lg font-medium">
            Jarvis Voice
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-900 hover:text-slate-300"
          >
            <X size={16} />
          </button>
        )}

      </header>

      {/* Main voice interface */}

      <div className="relative flex flex-col items-center px-5 py-12">

        {/* Orb */}

        <button
          onClick={
            isListening
              ? stopListening
              : startListening
          }
          className={`relative flex h-36 w-36 items-center justify-center rounded-full border transition-all duration-500 ${
            isListening
              ? "border-cyan-300 bg-cyan-400/10 shadow-[0_0_100px_rgba(34,211,238,0.3)]"
              : "border-cyan-400/30 bg-cyan-400/5 hover:border-cyan-400/60"
          }`}
        >

          {/* Outer ring */}

          <span
            className={`absolute inset-3 rounded-full border border-cyan-400/20 ${
              isListening
                ? "animate-ping"
                : ""
            }`}
          />

          {/* Inner ring */}

          <span className="absolute inset-7 rounded-full border border-cyan-400/20" />

          {isListening ? (
            <Mic
              size={30}
              className="relative z-10 text-cyan-300"
            />
          ) : (
            <MicOff
              size={28}
              className="relative z-10 text-slate-500"
            />
          )}

        </button>

        {/* Status */}

        <div className="mt-8 text-center">

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
            {status === "idle" &&
              "READY"}

            {status === "listening" &&
              "LISTENING"}

            {status === "processing" &&
              "PROCESSING"}

            {status === "speaking" &&
              "SPEAKING"}
          </p>

          <p className="mt-3 text-sm text-slate-400">
            {response}
          </p>

        </div>

        {/* Transcript */}

        {transcript && (
          <div className="mt-8 w-full max-w-xl rounded-xl border border-slate-800 bg-black/30 p-4">

            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
              TRANSCRIPT
            </p>

            <p className="mt-2 text-sm text-slate-300">
              "{transcript}"
            </p>

          </div>
        )}

        {/* Instructions */}

        <div className="mt-8 flex flex-wrap justify-center gap-2">

          {[
            "Create a task",
            "Show my tasks",
            "Complete the first task",
            "System status",
          ].map((example) => (
            <span
              key={example}
              className="rounded-full border border-slate-800 px-3 py-1.5 font-mono text-[9px] text-slate-600"
            >
              "{example}"
            </span>
          ))}

        </div>

      </div>

      {/* Footer */}

      <footer className="flex items-center justify-center gap-2 border-t border-slate-800 px-5 py-3">

        <Volume2
          size={12}
          className="text-slate-700"
        />

        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
          Voice responses enabled
        </span>

      </footer>

    </section>
  );
}