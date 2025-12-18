import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

/**
 * Важно для Render/любого reverse proxy:
 * чтобы req.protocol стал "https" (по X-Forwarded-Proto),
 * иначе ты генеришь http-ссылки и ловишь Mixed Content на фронте.
 */
app.set("trust proxy", 1); // [web:487]

// --- Для ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Статическая папка для загруженных картинок ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

// Тестовый корневой маршрут
app.get("/", (req, res) => {
  res.send("Backend работает! 🚀");
});

// --- MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB подключена");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Сервер запущен на порту ${port}`));
  })
  .catch((err) => console.log(err));
