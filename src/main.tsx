import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

import { JarvisProvider } from "./context/JarvisContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JarvisProvider>
      <App />
    </JarvisProvider>
  </StrictMode>
);