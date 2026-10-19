import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";

console.log("[NextJob] main.tsx executing...");

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("[NextJob] Fatal: #root element not found!");
} else {
  try {
    ReactDOM.createRoot(rootEl).render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    console.log("[NextJob] ReactDOM.createRoot mounted successfully.");
  } catch (err) {
    console.error("[NextJob] Error mounting root:", err);
    const message = err instanceof Error ? err.stack || err.message : String(err);
    rootEl.innerHTML = `<div style="padding:20px;color:red;font-family:sans-serif;"><h2>Render Error</h2><pre>${message}</pre></div>`;
  }
}
