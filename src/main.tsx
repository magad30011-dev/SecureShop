import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { useAuth } from "./lib/auth"; // ✅ مهم
import "./styles.css";

// const router = getRouter();

// ✅ نحطها داخل component عشان نستخدم useAuth
function App() {
  const { user } = useAuth();

  return (
    <RouterProvider
      router={router}
      context={{ user }} // 🔥 هذا هو الحل
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);