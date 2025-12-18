import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware.js";
import {
  getMe,
  updateMe,
  getUserProfile,
  updateMyAvatar,
} from "../controllers/userController.js";

const router = express.Router();

/* ===========================
   🔹 MULTER (uploads/)
=========================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Абсолютный путь к backend/uploads
const uploadDir = path.join(__dirname, "..", "uploads");

// ✅ ВАЖНО: гарантируем, что папка существует (иначе на Render будет ENOENT)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

/* ===========================
   🔹 ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
=========================== */
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateMe);

// ✅ Аватар
router.patch("/me/avatar", authMiddleware, upload.single("avatar"), updateMyAvatar);

/* ===========================
   🔹 ПУБЛИЧНЫЙ ПРОФИЛЬ
   (публичный, но если токен есть — добавит isMe)
=========================== */
router.get("/:username", optionalAuthMiddleware, getUserProfile);

export default router;
