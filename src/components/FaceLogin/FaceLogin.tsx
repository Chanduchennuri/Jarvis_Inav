import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, ShieldCheck } from "lucide-react";

interface FaceLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
const LOGIN_URL = API_BASE_URL ? `${API_BASE_URL}/api/login` : "";
if (!LOGIN_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}
type ScanStatus =
  | "idle"
  | "starting"
  | "scanning"
  | "verifying"
  | "success"
  | "error";

export default function FaceLogin({ onSuccess, onBack }: FaceLoginProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const successTimerRef = useRef<number | null>(null);
  const onSuccessRef = useRef(onSuccess);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [scanStarted, setScanStarted] = useState(false);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [countdown, setCountdown] = useState(5);
  const [message, setMessage] = useState("Enter your credentials to begin.");
  const [cameraError, setCameraError] = useState(false);
  const [cameraAttempt, setCameraAttempt] = useState(0);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  // Open the camera after the user submits their credentials.
  useEffect(() => {
    if (!scanStarted) return;

    let active = true;
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access requires HTTPS or localhost.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          throw new Error("Camera video element is unavailable.");
        }

        video.srcObject = stream;
        await video.play();

        if (active) {
          setCameraError(false);
          setCountdown(5);
          setMessage("Camera ready. Look directly at the camera.");
          setStatus("scanning");
        }
      } catch (error) {
        stream?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (!active) return;

        setCameraError(true);
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Could not access the camera."
        );
      }
    }

    void startCamera();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraAttempt, scanStarted]);

  // Countdown before submitting the captured frame.
  useEffect(() => {
    if (status !== "scanning") return;

    if (countdown <= 0) {
      setStatus("verifying");
      setMessage("Analyzing biometric pattern...");
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, status]);

  // Capture a camera frame and send the credentials and image to the API.
  useEffect(() => {
    if (status !== "verifying") return;

    const controller = new AbortController();

    async function verifyFace() {
      try {
        const video = videoRef.current;

        if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
          throw new Error("Camera frame is not ready.");
        }

        const captureCanvas = document.createElement("canvas");
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;

        const context = captureCanvas.getContext("2d");
        if (!context) {
          throw new Error("Could not capture camera frame.");
        }

        context.drawImage(video, 0, 0);

        const imageBlob = await new Promise<Blob>((resolve, reject) => {
          captureCanvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Could not create image."));
            },
            "image/jpeg",
            0.9
          );
        });

        const formData = new FormData();
        formData.append("user_id", userId.trim());
        formData.append("password", password);
        formData.append("file", imageBlob, "face.jpg");

        const response = await fetch(LOGIN_URL, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        const result: { detail?: string; message?: string } =
          await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.detail || result.message || "Face verification failed."
          );
        }

        setStatus("success");
        setMessage("Identity verified");

        successTimerRef.current = window.setTimeout(() => {
          onSuccessRef.current();
        }, 1200);
      } catch (error) {
        if (controller.signal.aborted) return;

        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Face verification failed."
        );
      }
    }

    void verifyFace();

    return () => controller.abort();
  }, [status, userId, password]);

  // Draw the animated scanning overlay.
  useEffect(() => {
    if (status !== "scanning" && status !== "verifying") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let scanPosition = 0;
    let animationId = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const boxWidth = width * 0.52;
      const boxHeight = height * 0.68;
      const x = (width - boxWidth) / 2;
      const y = (height - boxHeight) / 2;
      const corner = 28;

      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(34, 211, 238, 0.9)";
      context.lineWidth = 2;

      context.beginPath();
      context.moveTo(x, y + corner);
      context.lineTo(x, y);
      context.lineTo(x + corner, y);
      context.stroke();

      context.beginPath();
      context.moveTo(x + boxWidth - corner, y);
      context.lineTo(x + boxWidth, y);
      context.lineTo(x + boxWidth, y + corner);
      context.stroke();

      context.beginPath();
      context.moveTo(x, y + boxHeight - corner);
      context.lineTo(x, y + boxHeight);
      context.lineTo(x + corner, y + boxHeight);
      context.stroke();

      context.beginPath();
      context.moveTo(x + boxWidth - corner, y + boxHeight);
      context.lineTo(x + boxWidth, y + boxHeight);
      context.lineTo(x + boxWidth, y + boxHeight - corner);
      context.stroke();

      scanPosition = (scanPosition + 3) % boxHeight;

      context.beginPath();
      context.moveTo(x + 10, y + scanPosition);
      context.lineTo(x + boxWidth - 10, y + scanPosition);
      context.strokeStyle = "rgba(34, 211, 238, 0.65)";
      context.lineWidth = 1;
      context.stroke();

      const points = [
        [0.35, 0.38],
        [0.65, 0.38],
        [0.5, 0.48],
        [0.4, 0.62],
        [0.6, 0.62],
      ];

      points.forEach(([px, py]) => {
        context.beginPath();
        context.arc(x + boxWidth * px, y + boxHeight * py, 3, 0, Math.PI * 2);
        context.fillStyle = "rgba(103, 232, 249, 0.9)";
        context.fill();
      });

      animationId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => window.cancelAnimationFrame(animationId);
  }, [status]);

  useEffect(
    () => () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    },
    []
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId.trim() || !password) {
      setMessage("Enter both your username and password.");
      return;
    }

    setCameraError(false);
    setCountdown(5);
    setMessage("Initializing camera...");
    setStatus("starting");
    setScanStarted(true);
  }

  function retryCamera() {
    setCameraError(false);
    setCountdown(5);
    setMessage("Initializing camera...");
    setStatus("starting");
    setCameraAttempt((attempt) => attempt + 1);
  }

  const isBusy = status === "starting" || status === "scanning" || status === "verifying";

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-slate-200"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span className="font-mono text-xs tracking-widest text-slate-500">
              SECURE ACCESS
            </span>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-8">
          <div className="mb-8 text-center">
            <p className="font-mono text-xs tracking-[0.4em] text-cyan-400">
              BIOMETRIC AUTHENTICATION
            </p>
            <h1 className="mt-4 text-3xl font-semibold">Face verification</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials, then look at the camera.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mb-6 grid w-full max-w-md gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl"
          >
            <label className="grid gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              Username
              <input
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                disabled={isBusy}
                required
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm normal-case tracking-normal text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
              />
            </label>

            <label className="grid gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              Password
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isBusy}
                required
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm normal-case tracking-normal text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
              />
            </label>

            {!scanStarted && (
              <button
                type="submit"
                className="mt-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Start face login
              </button>
            )}
          </form>

          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />

              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />

              {status === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600">
                  <Camera size={36} />
                  <span className="font-mono text-xs uppercase tracking-widest">
                    Camera will start after login
                  </span>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-black/40 px-3 py-1.5 backdrop-blur">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      status === "error"
                        ? "bg-red-400"
                        : status === "success"
                          ? "bg-emerald-400"
                          : status === "idle"
                            ? "bg-slate-500"
                            : "animate-pulse bg-cyan-400"
                    }`}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
                    {status === "success"
                      ? "VERIFIED"
                      : status === "error"
                        ? "ERROR"
                        : status === "starting"
                          ? "STARTING CAMERA"
                          : status === "idle"
                            ? "STANDBY"
                            : status === "verifying"
                              ? "VERIFYING"
                              : "SCANNING"}
                  </span>
                </div>

                <Camera size={16} className="text-slate-400" />
              </div>

              <div className="absolute bottom-5 left-0 right-0 text-center">
                <p className="font-mono text-xs text-cyan-300">{message}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            {status === "scanning" && (
              <>
                <div className="font-mono text-4xl font-light text-cyan-300">
                  00:0{countdown}
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-600">
                  Hold still
                </p>
              </>
            )}

            {status === "verifying" && (
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-cyan-300">
                  Verifying identity
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={42} className="text-emerald-400" />
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-emerald-300">
                  Identity verified
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="max-w-md">
                <p className="text-sm text-red-400">{message}</p>
                <button
                  type="button"
                  onClick={retryCamera}
                  className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  Retry
                </button>
              </div>
            )}

            {cameraError && (
              <p className="mt-5 text-[10px] text-slate-600">
                Allow camera access in your browser. Camera access requires
                localhost or HTTPS.
              </p>
            )}
          </div>
        </section>

        <footer className="pt-6 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-700">
            JARVIS // PERSONAL INTELLIGENCE SYSTEM
          </p>
        </footer>
      </div>
    </main>
  );
}