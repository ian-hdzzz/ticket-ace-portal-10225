import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getAppMode } from "./lib/config";

// Log current mode (only in development)
if (import.meta.env.DEV) {
  const mode = getAppMode();
  console.log(`🚀 Application running in ${mode.toUpperCase()} mode`);
  if (mode === "demo") {
    console.log("📝 Using mock data - no backend required");
  }
}

createRoot(document.getElementById("root")!).render(<App />);
