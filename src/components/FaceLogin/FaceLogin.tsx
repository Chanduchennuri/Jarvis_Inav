import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, ShieldCheck } from "lucide-react";

interface FaceLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

type ScanStatus =
  | "starting"
  | "scanning"
  | "verifying"
  | "success"
  | "error";

export default function FaceLogin({
  onSuccess,
  onBack,
}: FaceLoginProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const [status, setStatus] = useState<ScanStatus>("starting");
  const [countdown, setCountdown] = useState(5);
  const [message, setMessage] = useState(
    "Initializing camera..."
  );
  const [cameraError, setCameraError] = useState(false);

  /*
   * Start camera
   */
  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("scanning");
        setMessage("Position your face inside the frame");
      } catch (error) {
        console.error("Camera error:", error);

        if (mounted) {
          setCameraError(true);
          setStatus("error");
          setMessage(
            "Camera access is required for face verification."
          );
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  /*
   * Canvas scanning animation
   */
  useEffect(() => {
    if (status !== "scanning" && status !== "verifying") {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let scanPosition = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      context.clearRect(0, 0, width, height);

      /*
       * Face scanning box
       */
      const boxWidth = width * 0.52;
      const boxHeight = height * 0.68;

      const x = (width - boxWidth) / 2;
      const y = (height - boxHeight) / 2;

      const corner = 28;

      context.strokeStyle = "rgba(34, 211, 238, 0.9)";
      context.lineWidth = 2;

      // Top-left
      context.beginPath();
      context.moveTo(x, y + corner);
      context.lineTo(x, y);
      context.lineTo(x + corner, y);
      context.stroke();

      // Top-right
      context.beginPath();
      context.moveTo(x + boxWidth - corner, y);
      context.lineTo(x + boxWidth, y);
      context.lineTo(x + boxWidth, y + corner);
      context.stroke();

      // Bottom-left
      context.beginPath();
      context.moveTo(x, y + boxHeight - corner);
      context.lineTo(x, y + boxHeight);
      context.lineTo(x + corner, y + boxHeight);
      context.stroke();

      // Bottom-right
      context.beginPath();
      context.moveTo(
        x + boxWidth - corner,
        y + boxHeight
      );
      context.lineTo(
        x + boxWidth,
        y + boxHeight
      );
      context.lineTo(
        x + boxWidth,
        y + boxHeight - corner
      );
      context.stroke();

      /*
       * Scanning line
       */
      scanPosition += 3;

      if (scanPosition > boxHeight) {
        scanPosition = 0;
      }

      context.beginPath();

      context.moveTo(
        x + 10,
        y + scanPosition
      );

      context.lineTo(
        x + boxWidth - 10,
        y + scanPosition
      );

      context.strokeStyle =
        "rgba(34, 211, 238, 0.65)";

      context.lineWidth = 1;

      context.stroke();

      /*
       * Fake biometric points
       */
      const points = [
        [0.35, 0.38],
        [0.65, 0.38],
        [0.5, 0.48],
        [0.4, 0.62],
        [0.6, 0.62],
      ];

      points.forEach(([px, py]) => {
        context.beginPath();

        context.arc(
          x + boxWidth * px,
          y + boxHeight * py,
          3,
          0,
          Math.PI * 2
        );

        context.fillStyle =
          "rgba(103, 232, 249, 0.9)";

        context.fill();
      });

      animationRef.current =
        requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [status]);

  /*
   * Dummy verification countdown
   */
  useEffect(() => {
    if (status !== "scanning") {
      return;
    }

    if (countdown <= 0) {
      setStatus("verifying");
      setMessage("Analyzing biometric pattern...");

      const timer = setTimeout(() => {
        setStatus("success");
        setMessage("Identity verified");

        setTimeout(() => {
          onSuccess();
        }, 1200);
      }, 1800);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, status, onSuccess]);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col">

        {/* Header */}
        <header className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-slate-200"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-cyan-400"
            />

            <span className="font-mono text-xs tracking-widest text-slate-500">
              SECURE ACCESS
            </span>
          </div>
        </header>

        {/* Main */}
        <section className="flex flex-1 flex-col items-center justify-center">

          {/* Heading */}
          <div className="mb-8 text-center">
            <p className="font-mono text-xs tracking-[0.4em] text-cyan-400">
              BIOMETRIC AUTHENTICATION
            </p>

            <h1 className="mt-4 text-3xl font-semibold">
              Face verification
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Look directly at the camera.
            </p>
          </div>

          {/* Camera */}
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
                className="absolute inset-0 h-full w-full"
              />

              {/* Camera overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

              {/* Top status */}
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-black/40 px-3 py-1.5 backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
                    {status === "success"
                      ? "VERIFIED"
                      : "SCANNING"}
                  </span>
                </div>

                <Camera
                  size={16}
                  className="text-slate-400"
                />
              </div>

              {/* Bottom status */}
              <div className="absolute bottom-5 left-0 right-0 text-center">
                <p className="font-mono text-xs text-cyan-300">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
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
                <CheckCircle2
                  size={42}
                  className="text-emerald-400"
                />

                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-emerald-300">
                  Identity verified
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="max-w-md">
                <p className="text-sm text-red-400">
                  {message}
                </p>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  Retry camera
                </button>
              </div>
            )}

            {cameraError && (
              <p className="mt-5 text-[10px] text-slate-600">
                Camera access is handled locally by your browser
                during this prototype.
              </p>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-700">
            JARVIS // PERSONAL INTELLIGENCE SYSTEM
          </p>
        </footer>
      </div>
    </main>
  );
}