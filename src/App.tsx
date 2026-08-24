import { useState } from "react";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";

import FaceLogin from "./components/FaceLogin/FaceLogin";
import TerminalLogin from "./components/Terminal/TerminalLogin";
import JarvisBoot from "./components/Jarvis/JarvisBoot";
import JarvisDashboard from "./components/Dashboard/JarvisDashboard";

type AppScreen =
  | "welcome"
  | "login"
  | "face"
  | "terminal"
  | "boot"
  | "dashboard";

function App() {
  const [screen, setScreen] =
    useState<AppScreen>("welcome");

  if (screen === "welcome") {
    return (
      <Welcome
        onComplete={() => setScreen("login")}
      />
    );
  }

  if (screen === "login") {
    return (
      <Login
        onFaceLogin={() => setScreen("face")}
        onTerminalLogin={() => setScreen("terminal")}
      />
    );
  }

  if (screen === "face") {
    return (
      <FaceLogin
        onBack={() => setScreen("login")}
        onSuccess={() => setScreen("boot")}
      />
    );
  }

  if (screen === "terminal") {
    return (
      <TerminalLogin
        onBack={() => setScreen("login")}
        onSuccess={() => setScreen("boot")}
      />
    );
  }

  if (screen === "boot") {
    return (
      <JarvisBoot
        onComplete={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "dashboard") {
    return (
       <JarvisDashboard />
    );
  }

  return null;
}

export default App;