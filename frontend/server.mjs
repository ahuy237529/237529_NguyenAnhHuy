import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(currentDir, "dist");

const PORT = Number(process.env.PORT) || 4173;

const API_URL = (
  process.env.API_URL || "http://127.0.0.1:5001"
).replace(/\/+$/, "");

app.get("/config.json", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ API_URL });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(express.static(distDir));

app.use((req, res) => {
  if (req.method === "GET") {
    return res.sendFile(path.join(distDir, "index.html"));
  }

  res.status(404).json({
    message: "Không tìm thấy tài nguyên"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend running on port ${PORT}`);
});