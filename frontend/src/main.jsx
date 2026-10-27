import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

async function startApp() {
  try {
    // Bản production đọc cấu hình từ server.
    if (import.meta.env.PROD) {
      const response = await fetch("/config.json", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Không đọc được cấu hình Frontend");
      }

      window.APP_CONFIG = await response.json();

      if (!window.APP_CONFIG.API_URL) {
        throw new Error("Chưa cấu hình địa chỉ Backend API");
      }
    }

    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    document.getElementById("root").textContent = error.message;
  }
}

startApp();