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

// --- Для ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Статическая папка для загруженных картинок ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
// Авторизация
app.use("/auth", authRoutes);

// Посты (создание, получение)
app.use("/posts", postRoutes);

// Юзеры
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
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Сервер запущен на порту ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.log(err));
