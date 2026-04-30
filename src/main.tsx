import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { AuthProvider } from "./lib/auth"; // 🔥 مهم جدًا
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider> {/* 🔥 يحل مشكلة الشاشة البيضاء */}
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);