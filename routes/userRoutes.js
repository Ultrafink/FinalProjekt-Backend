import express from "express";
import path from "path";
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

// сохраняем в backend/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

/* ===========================
   🔹 ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
=========================== */
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateMe);

// ✅ Аватар (как у тебя на фронте)
router.patch(
  "/me/avatar",
  authMiddleware,
  upload.single("avatar"),
  updateMyAvatar
);

/* ===========================
   🔹 ПУБЛИЧНЫЙ ПРОФИЛЬ
   (публичный, но если токен есть — добавит isMe)
=========================== */
router.get("/:username", optionalAuthMiddleware, getUserProfile);

export default router;
