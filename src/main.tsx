import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./app/App.tsx";
import "./styles/index.css";
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster
      position="top-center"
      theme="dark"
      richColors
      toastOptions={{
        style: {
          background: "#18181b",
          border: "1px solid #27272a",
          color: "#fff",
        },
      }}
    />
  </>
);